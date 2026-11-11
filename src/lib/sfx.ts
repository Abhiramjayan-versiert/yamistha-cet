/*
 * Small synthesised sound effects: chimes for section changes and
 * hovers, a breath of wind for larger moments. Nothing is loaded from
 * the network. Effects only sound while the music is playing, so the
 * music toggle silences everything at once.
 */

/* D hirajoshi, the scale the soundtrack is written in */
const SCALE = [587.33, 659.25, 698.46, 880.0, 932.33, 1174.66];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;
let lastHover = 0;

function live(): { ac: AudioContext; out: GainNode } | null {
  return enabled && ctx && master && ctx.state === 'running' ? { ac: ctx, out: master } : null;
}

export const sfx = {
  /* Must be called from a user gesture (the ENTER button or the music toggle). */
  unlock() {
    try {
      if (!ctx) {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        ctx = new Ctor();
        master = ctx.createGain();
        master.gain.value = 0.6;
        master.connect(ctx.destination);
      }
      void ctx.resume();
    } catch {
      ctx = null;
    }
  },

  setEnabled(value: boolean) {
    enabled = value;
  },

  setVolume(value: number) {
    if (master) master.gain.value = 0.25 + value * 0.75;
  },

  chime(step = 0, level = 0.05) {
    const node = live();
    if (!node) return;
    const { ac, out } = node;
    const now = ac.currentTime;
    const freq = SCALE[((step % SCALE.length) + SCALE.length) % SCALE.length];
    [1, 2.76, 5.4].forEach((ratio, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      const peak = level / (1 + i * 2.4);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2 / (1 + i));
      osc.connect(gain).connect(out);
      osc.start(now);
      osc.stop(now + 2.4);
    });
  },

  /* a very quiet touch of glass, rate limited */
  hover() {
    const t = performance.now();
    if (t - lastHover < 160) return;
    lastHover = t;
    this.chime(Math.floor(Math.random() * SCALE.length), 0.016);
  },

  wind(seconds = 2.4, level = 0.07) {
    const node = live();
    if (!node) return;
    const { ac, out } = node;
    const now = ac.currentTime;
    const length = Math.floor(ac.sampleRate * seconds);
    const buffer = ac.createBuffer(1, length, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(980, now + seconds * 0.55);
    filter.frequency.exponentialRampToValueAtTime(420, now + seconds);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(level, now + seconds * 0.4);
    gain.gain.linearRampToValueAtTime(0, now + seconds);
    source.connect(filter).connect(gain).connect(out);
    source.start(now);
  },
};
