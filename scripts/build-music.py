"""
Original soundtrack for YAMISHTA 2026.

The whole piece is synthesised here from sine waves, plucked string
models and filtered noise. It uses no samples and no third party
recordings, so the fest owns it outright.

Usage:
    python3 scripts/build-music.py            # writes theme.wav
    ffmpeg -i theme.wav -codec:a libmp3lame -b:a 112k public/audio/yamishta-theme.mp3
"""
import numpy as np, wave
SR = 44100
BEAT = 1.0            # 60 bpm
BARS = 32
BODY = BARS * 4 * BEAT
TAIL = 8.0
N = int((BODY + TAIL) * SR)
rng = np.random.default_rng(2026)
L = np.zeros(N); R = np.zeros(N)

NOTE = {'C':0,'C#':1,'D':2,'Eb':3,'E':4,'F':5,'F#':6,'G':7,'Ab':8,'A':9,'Bb':10,'B':11}
def hz(name):
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((NOTE[n] + 12 * (o + 1) - 69) / 12)

def add(sig, t, pan=0.0, gain=1.0):
    i = max(0, int(t * SR))
    if i >= N: return
    sig = sig[: N - i]
    a = np.pi / 4 * (pan + 1)
    L[i:i + len(sig)] += sig * np.cos(a) * gain
    R[i:i + len(sig)] += sig * np.sin(a) * gain

def piano(f, dur=5.0, vel=1.0):
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros_like(t)
    for k in range(1, 9):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)
        if fk > 9000: break
        amp = (1.0 / k ** 1.7) * (vel ** (0.3 * k))
        out += amp * np.exp(-t * (0.55 + 0.42 * k)) * np.sin(2 * np.pi * fk * t + rng.uniform(0, 0.3))
    att = np.minimum(1, t / 0.012)
    return out * att * vel

def koto(f, dur=3.5, vel=1.0, bright=0.55):
    p = int(round(SR / f))
    n = int(dur * SR)
    buf = rng.uniform(-1, 1, p)
    # soften the excitation
    for _ in range(2):
        buf = bright * buf + (1 - bright) * np.roll(buf, 1)
    buf -= buf.mean()
    out = np.empty(n + p)
    out[:p] = buf
    damp = 0.9965 if f < 500 else 0.9975
    pos = p
    while pos < n + p:
        prev = out[pos - p:pos]
        nxt = damp * 0.5 * (prev + np.roll(prev, 1))
        nxt[0] = damp * 0.5 * (prev[0] + out[pos - p - 1] if pos - p - 1 >= 0 else prev[0])
        m = min(p, n + p - pos)
        out[pos:pos + m] = nxt[:m]
        pos += m
    out = out[p:]
    t = np.arange(n) / SR
    return out * np.minimum(1, t / 0.004) * np.exp(-t * 0.5) * vel

def chime(f, dur=6.0, vel=1.0):
    t = np.arange(int(dur * SR)) / SR
    out = np.sin(2*np.pi*f*t) * np.exp(-t*0.9) + 0.35*np.sin(2*np.pi*f*2.76*t) * np.exp(-t*1.8) + 0.12*np.sin(2*np.pi*f*5.4*t) * np.exp(-t*3.5)
    return out * np.minimum(1, t / 0.02) * vel

def pad(notes, dur):
    n = int((dur + 6) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for nm in notes:
        f = hz(nm)
        for det in (-0.35, 0.0, 0.4):
            ff = f * 2 ** (det / 120)
            ph = rng.uniform(0, 6.28)
            out += np.sin(2*np.pi*ff*t + ph) + 0.22*np.sin(2*np.pi*2*ff*t + ph*1.3) + 0.07*np.sin(2*np.pi*3*ff*t)
    env = np.minimum(1, t / 3.5) * np.minimum(1, np.maximum(0, (dur + 6 - t) / 5.5))
    env = env ** 1.5
    trem = 1 + 0.12 * np.sin(2*np.pi*0.11*t + rng.uniform(0, 6.28))
    return out * env * trem / len(notes)

CH = {
 'Dm9':  ['D3','A3','E4','F4'],
 'Bb':   ['Bb2','F3','A3','D4'],
 'F':    ['F2','C3','A3','E4'],
 'DmA':  ['A2','D3','F3','A3'],
 'Dm':   ['D3','A3','D4','F4'],
}
prog = ['Dm9','Dm9','Bb','Bb','F','F','DmA','DmA','Dm9','Dm9','Bb','Bb','F','F','Dm','Dm'] * 2

# pads (2 bar blocks, overlapping tails)
for b in range(0, BARS, 2):
    add(pad(CH[prog[b]], 8.0), b * 4.0 - (1.5 if b else 0), pan=0.0, gain=0.085)
    add(pad([CH[prog[b]][0][:-1] + '2' if CH[prog[b]][0][-1] == '3' else CH[prog[b]][0]], 8.0), b * 4.0 - (1.5 if b else 0), gain=0.07)

# piano broken chords
for b in range(BARS):
    c = CH[prog[b]]
    second = b >= 16
    pat = [(0, c[0], 0.62), (1, c[1], 0.42), (2, c[2], 0.5), (3, c[3] if b % 2 else c[1], 0.38)]
    if second and b % 2 == 0:
        pat.append((2.5, c[3], 0.34))
    if b in (15, 31):
        pat = [(0, c[0], 0.6), (1, c[1], 0.4), (2, c[3], 0.42)]
    for beat, nm, v in pat:
        v *= rng.uniform(0.88, 1.08)
        add(piano(hz(nm), 6.0, v), b * 4.0 + beat + rng.uniform(-0.012, 0.012), pan=-0.25 + 0.12 * (NOTE[nm[:-1]] % 5) / 4, gain=0.30)

# koto melody, hirajoshi on D (D E F A Bb)
mel = [
 [(0,'A4'),(1.5,'Bb4'),(2,'A4')],
 [(0,'F4'),(2,'E4'),(3,'D4')],
 [(0,'E4'),(1,'F4'),(2,'A4')],
 [(0,'D5')],
 [(0,'Bb4'),(1.5,'A4'),(2,'F4')],
 [(0,'A4'),(2,'D5'),(3,'E5')],
 [(0,'F5'),(1,'E5'),(2,'D5'),(3,'Bb4')],
 [(0,'A4')],
 [(0,'D5'),(1.5,'E5'),(2,'D5')],
 [(0,'A4'),(2,'F4')],
 [(0,'E4'),(1,'A4'),(2,'E5')],
 [(0,'D5')],
 [(0,'A4'),(1,'Bb4'),(2,'A4'),(3,'F4')],
 [(0,'E4'),(2,'F4')],
 [(0,'E4'),(2,'D4')],
 [],
]
def up(nm): return nm[:-1] + str(int(nm[-1]) + 1)
for rep in range(2):
    for b, bar in enumerate(mel):
        for beat, nm in bar:
            t = (rep * 16 + b) * 4.0 + beat
            v = rng.uniform(0.8, 1.0) * (1.0 if beat == 0 else 0.82)
            if rep == 0 and b < 2:   # let the piano open alone
                continue
            add(koto(hz(nm), 4.0, v), t + rng.uniform(-0.01, 0.015), pan=0.3, gain=0.26)
            if rep == 1 and b in (3, 7, 11) :
                add(koto(hz(up(nm)), 4.0, v * 0.5, bright=0.4), t + 0.07, pan=0.45, gain=0.2)
            if rep == 1 and beat == 0 and b % 4 == 0:
                # soft grace note a scale step below
                add(koto(hz(nm) * 2 ** (-2 / 12) if nm[:-1] in ('A', 'E') else hz(nm) * 2 ** (-1 / 12), 0.6, v * 0.35), t - 0.11, pan=0.3, gain=0.2)

# chimes, like ice
for b, nm in [(3,'D6'),(7,'A5'),(11,'D6'),(15,'A6'),(19,'D6'),(21,'F6'),(23,'A5'),(27,'E6'),(31,'D6')]:
    add(chime(hz(nm), 6.0, 0.8), b * 4.0 + 2.0, pan=-0.5 if b % 8 == 3 else 0.5, gain=0.05)
    add(chime(hz(nm) * 1.5, 5.0, 0.4), b * 4.0 + 2.5, pan=0.5 if b % 8 == 3 else -0.5, gain=0.035)

# reverb: decaying filtered noise impulse, different per channel
def reverb(x, seed):
    r = np.random.default_rng(seed)
    n = int(3.6 * SR)
    t = np.arange(n) / SR
    ir = r.normal(0, 1, n) * np.exp(-t * 1.9)
    spec = np.fft.rfft(ir); fr = np.fft.rfftfreq(n, 1 / SR)
    spec *= 1 / (1 + (fr / 3800) ** 2) * (fr / (fr + 180))
    ir = np.fft.irfft(spec, n); ir[: int(0.018 * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum())
    m = len(x) + n
    size = 1 << (m - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
wl, wr = reverb(L, 1), reverb(R, 2)
L = L * 0.78 + 0.34 * wl + 0.08 * wr
R = R * 0.78 + 0.34 * wr + 0.08 * wl

# winter wind, very quiet band limited noise
def wind(seed):
    r = np.random.default_rng(seed)
    x = r.normal(0, 1, N)
    spec = np.fft.rfft(x); fr = np.fft.rfftfreq(N, 1 / SR)
    spec *= np.exp(-((np.log(np.maximum(fr, 1) / 520)) ** 2) / 0.5)
    x = np.fft.irfft(spec, N); x /= np.abs(x).max()
    t = np.arange(N) / SR
    lfo = 0.45 + 0.3 * np.sin(2*np.pi*t/23 + seed) + 0.25 * np.sin(2*np.pi*t/9.7 + 2*seed)
    return x * np.clip(lfo, 0.05, 1)
L += 0.028 * wind(5); R += 0.028 * wind(9)

# master: gentle high shelf cut, fades, normalise
t = np.arange(N) / SR
fade = np.minimum(1, t / 2.5) * np.minimum(1, np.maximum(0, (BODY + TAIL - t) / 7.0)) ** 1.3
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
print('raw peak', peak, 'rms', np.sqrt((L**2).mean()))
g = 0.84 / peak
st = np.stack([L, R], 1) * g
st = np.tanh(st * 1.15) / np.tanh(1.15)
print('rms dB', 20*np.log10(np.sqrt((st**2).mean())))
with wave.open('theme.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767 * 0.95).astype('<i2').tobytes())
