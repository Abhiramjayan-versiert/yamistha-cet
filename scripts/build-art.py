"""
Builds every image in public/art from the YAMISHTA reference painting.

Nothing here invents artwork. Each output is a crop or a cut-out layer of
the original illustration (art-source/yamishta-reference.jpg):

  scene-*.webp   the full painting, with the great branch lifted out of
                 the sky so that it can sway as its own layer
  branch.webp    the great cherry branch, cut from the sky
  cloud-*.webp   clouds cut from the painting, used as drifting layers
  card-*.webp    crops used on event cards
  panel-*.webp   crops used as framed windows in sections
  og.jpg         social sharing image

Usage:  python3 scripts/build-art.py <painting.png> [scale]
        <painting.png> may be the original or an upscaled copy of it;
        scale is how many times larger than 816 x 1456 it is (default 2).
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src = sys.argv[1]
S = int(sys.argv[2]) if len(sys.argv) > 2 else 2
OUT = 'public/art/'
im = Image.open(src).convert('RGB')
assert im.size == (816 * S, 1456 * S), im.size
a = np.asarray(im).astype(np.int16)
H, W = a.shape[:2]
rng = np.random.default_rng(7)


def sky_mask(arr):
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    return (g - r > 22) & (b - r > 28)


def blur_mask(mask, radius):
    return np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius))) / 255.0


def grow(mask, px):
    m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(px * 2 + 1))
    return np.asarray(m) > 127


# ---------------------------------------------------------------- branch
BX, BY = 540 * S, 340 * S
region = a[:BY, :BX]
branch = grow(~sky_mask(region), S)            # the branch and its blossoms
alpha = blur_mask(branch, 0.6 * S)
# fade the layer out where the branch meets the clouds and the left edge trunk
yy = np.arange(BY)[:, None] / S
xx = np.arange(BX)[None, :] / S
fade = np.clip((338 - yy) / 46, 0, 1) * np.clip((538 - xx) / 14, 0, 1)
alpha = alpha * fade
rgba = np.dstack([region.astype(np.uint8), (alpha * 255).astype(np.uint8)])
Image.fromarray(rgba, 'RGBA').save(OUT + 'branch.webp', quality=86, method=6)

# paint sky back in behind the lifted branch, row by row, so the
# horizontal brush lines of the sky continue under it
base = a.copy()
fill = grow(branch, 2 * S)
fill_soft = blur_mask(fill, 1.2 * S) * np.clip((338 - yy) / 46, 0, 1) * np.clip((xx - 3) / 10, 0, 1)
sky_all = sky_mask(a)
for y in range(BY):
    cols = np.where(sky_all[y, : 660 * S] & ~np.pad(fill[y], (0, 660 * S - BX)))[0]
    if len(cols) < 40:
        cols = np.where(sky_all[y])[0]
    strip = a[y, cols]
    # walk the strip back and forth so strokes stay continuous
    n = len(strip)
    idx = (np.arange(BX) + rng.integers(0, n)) % (2 * n)
    idx = np.where(idx >= n, 2 * n - 1 - idx, idx)
    patch = strip[idx]
    k = fill_soft[y][:, None]
    base[y, :BX] = (a[y, :BX] * (1 - k) + patch * k).astype(np.int16)
scene = Image.fromarray(base.astype(np.uint8))
scene.save(OUT + 'scene-1632.webp', quality=82, method=6) if S == 2 else scene.resize((1632, 2912), Image.LANCZOS).save(OUT + 'scene-1632.webp', quality=82, method=6)
scene.resize((816, 1456), Image.LANCZOS).save(OUT + 'scene-816.webp', quality=82, method=6)


# ---------------------------------------------------------------- clouds
def cut_cloud(box, name, feather_bottom=0, feather_sides=0, out_w=720, erase=()):
    import cv2
    x0, y0, x1, y1 = [v * S for v in box]
    reg = a[y0:y1, x0:x1]
    r, g, b = reg[..., 0], reg[..., 1], reg[..., 2]
    # the cream body of the cloud only: no sky strokes, petals or peaks
    m = ((r > 150) & (g > r * 0.7) & (b < r) & (b > 80)).astype(np.uint8)
    gone = np.zeros(m.shape, bool)
    for ex0, ey0, ex1, ey1 in erase:
        gone[(ey0 - box[1]) * S:(ey1 - box[1]) * S, (ex0 - box[0]) * S:(ex1 - box[0]) * S] = True
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (4 * S + 1, 4 * S + 1))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, k)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    keep = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    m = (labels == keep).astype(np.uint8)
    # fill interior holes (the darker contour lines inside the cloud)
    ff = np.pad(m, 1)
    cv2.floodFill(ff, None, (0, 0), 2)
    m = (ff[1:-1, 1:-1] != 2)
    al = blur_mask(m, 0.7 * S)
    h, w = al.shape
    ys = np.arange(h)[:, None] / S
    xs = np.arange(w)[None, :] / S
    al = al * (1 - np.clip(blur_mask(gone, 7 * S) * 2, 0, 1))
    if feather_bottom:
        al = al * np.clip((h / S - ys) / feather_bottom, 0, 1)
    if feather_sides:
        al = al * np.clip(xs / feather_sides, 0, 1) * np.clip((w / S - xs) / feather_sides, 0, 1)
    img = Image.fromarray(np.dstack([reg.astype(np.uint8), (al * 255).astype(np.uint8)]), 'RGBA')
    img = img.resize((out_w, round(out_w * h / w)), Image.LANCZOS)
    img.save(OUT + name + '.webp', quality=84, method=6)


cut_cloud((488, 286, 742, 446), 'cloud-a', erase=[(684, 404, 742, 446), (700, 286, 742, 330)])
cut_cloud((196, 362, 486, 520), 'cloud-b', feather_bottom=44, feather_sides=26, out_w=860)


# ---------------------------------------------------------------- crops
def crop(box, name, size, quality=80):
    x0, y0, x1, y1 = [v * S for v in box]
    im.crop((x0, y0, x1, y1)).resize(size, Image.LANCZOS).save(OUT + name, quality=quality, method=6)


crop((96, 786, 456, 1056), 'card-temple.webp', (720, 540))
crop((536, 70, 816, 280), 'card-moon.webp', (720, 540))
crop((196, 498, 516, 738), 'card-ridge.webp', (720, 540))
crop((576, 462, 816, 642), 'card-peak.webp', (720, 540))
crop((236, 1096, 556, 1336), 'card-steps.webp', (720, 540))
crop((440, 280, 760, 520), 'card-clouds.webp', (720, 540))
crop((40, 770, 500, 1345), 'panel-pavilion.webp', (920, 1150))
crop((456, 880, 816, 1240), 'panel-valley.webp', (720, 720))
crop((0, 1150, 816, 1456), 'panel-grove.webp', (1632, 612))
crop((0, 380, 816, 760), 'panel-range.webp', (1632, 760))

x0, y0 = 0, 700 * S
og = im.crop((0, y0, 816 * S, y0 + round(816 * S * 630 / 1200))).resize((1200, 630), Image.LANCZOS)
og.save(OUT + 'og.jpg', quality=86)
print('art built')
