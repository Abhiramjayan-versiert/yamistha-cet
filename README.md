# YAMISHTA 2027

Website for YAMISHTA 2027, the National Management Fest of the College of Engineering Trivandrum.

The whole site is built from one painting (`art-source/yamishta-reference.jpg`). The painting is fixed behind the page and a camera travels over it: it rests on the pavilion at the entry screen, rises to the moon when the visitor enters, then descends through the clouds and mountains as they scroll, returning to the pavilion at the footer. Snow, drifting clouds, the swaying branch and falling petals are layered on top.

## Run it

```bash
npm install
npm run dev      # local development
npm run build    # production build in dist/
npm run preview  # serve the production build
```

Stack: React 19, TypeScript, Vite, plain CSS. No animation or UI libraries.

## Updating content

Everything editable lives in **`src/data/site.ts`**: tagline, dates, events, schedule, registration link, venue, partners, gallery and contacts.

- Values containing `TBA` and fields marked `PLACEHOLDER` are not real information. Replace them before launch. They are shown on the site with a dashed "placeholder" tag so nothing can be mistaken for confirmed detail.
- Leave a URL as `''` and its button shows an "opening soon" notice instead of a dead link.
- `registrationUrl`: the external registration form. The site itself never collects or stores data.
- `venue.mapEmbedUrl`: paste a Google Maps "Embed a map" URL to replace the map placeholder.
- Gallery: put photographs in `public/gallery/` and set `src` on each item. Frames without a `src` stay as empty mounts.
- Partners: add `logo` (a path in `public/`) and `url` per partner.

## Features and how to switch them on

| Feature | Where to configure it |
| --- | --- |
| Countdown | `site.startsAt` (Indian Standard Time, `YYYY-MM-DDTHH:mm`). Empty shows blank lanterns. |
| Announcement bar | `announcements`. Give each notice a new `id`. An empty list hides the bar. |
| Day and night sky | Automatic from the visitor's clock. Visitors can hold a phase with the Sky control in the footer. |
| Painting map | `places` (position in percent of the painting, and the section each leads to). |
| Hidden details | `secrets` and `secretReward`. Text placed there is readable in the page source, so do not treat a code as confidential. |
| Event search and filters | Built from each event's `category`, `day` and `format`. |
| Shareable event pages | Automatic. Each event is served at `/events/<slug>` with its own title and preview image. Set `site.url` to the final domain so previews resolve. |
| Add to calendar, and the live strip | Add `start` and `end` to schedule items (Indian Standard Time). Both appear only for items that have a `start`. |
| Results and standings | `results` and `standings`. |
| FAQ | `faqs`. |
| Wish lanterns | Works with no setup: lanterns are kept in the visitor's own browser. See below to share them between visitors. |
| Sound effects | Chimes and wind follow the music toggle and its volume. |

### Sharing wish lanterns between visitors (optional)

By default nothing a visitor writes leaves their browser. To show approved wishes to everyone, create a Supabase project, run this SQL, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project's environment variables.

```sql
create table wishes (
  id bigint generated always as identity primary key,
  text text not null check (char_length(text) between 1 and 80),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table wishes enable row level security;
create policy "anyone can submit" on wishes for insert to anon with check (approved = false);
create policy "approved are public" on wishes for select to anon using (approved = true);
```

New wishes arrive unapproved. A committee member sets `approved` to true in the Supabase table editor before a wish appears for other visitors.

## Structure

```
src/
  data/site.ts            all content
  components/
    Scene.tsx             the painting, camera, clouds, moon glow, branch, lamplight, sky
    Atmosphere.tsx        snowfall and petals (canvas)
    Gate.tsx              ENTER YAMISHTA opening screen
    Nav.tsx, Announcement.tsx, MusicControl.tsx, SkyControl.tsx, Footer.tsx
    Hero (with Countdown), About, PaintingMap, Events, Schedule, Registration,
    Results, Venue, Sponsors, Gallery, Wishes, Faq, Contact
  hooks/                  audio, sky, reduced motion, scroll reveal, active section
  lib/                    calendar files, sound effects, wish storage, time parsing
  styles/                 base (tokens), scene, chrome, sections, features
scripts/
  build-art.py            cuts every image in public/art from the painting
  build-music.py          synthesises the soundtrack
vite.config.ts            also writes one page per event at build time
vercel.json               routes /events/<slug> to the app
```

## Artwork

All images in `public/art` are crops or cut-out layers of the reference painting, produced by `scripts/build-art.py`. No other imagery is used. The colour palette in `src/styles/base.css` was sampled from the painting.

## Music

`public/audio/yamishta-theme.mp3` is an original piece generated by `scripts/build-music.py` (piano, koto style plucked strings, soft pads, chimes and wind, all synthesised). It contains no samples or third party recordings. To use a different track, replace the file and keep the same name. Playback starts only when the visitor presses ENTER YAMISHTA, because browsers block sound before a user gesture.

## Motion and performance

- Snow density adapts to screen size and device power, and thins itself if frames run slow.
- Animations pause when the tab is hidden.
- With "reduce motion" enabled, the camera, clouds and petals are still and the snow is drawn as a single frame.

## Fonts

Shippori Mincho and Zen Kaku Gothic New (SIL Open Font License), self-hosted through Fontsource.
