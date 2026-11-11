import { useCallback, useEffect, useRef, useState } from 'react';

const SRC = '/audio/yamishta-theme.mp3';
const STORE_KEY = 'yamishta-volume';

function readVolume(): number {
  try {
    const v = parseFloat(localStorage.getItem(STORE_KEY) ?? '');
    if (!Number.isNaN(v) && v >= 0 && v <= 1) return v;
  } catch {
    /* storage unavailable */
  }
  return 0.55;
}

/*
 * Background soundtrack. Playback only ever starts from a user gesture
 * (the ENTER button or the music control), because browsers block
 * autoplay with sound. Volume changes are eased so the music never cuts.
 */
export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(readVolume);
  const volumeRef = useRef(volume);

  const ensure = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio(SRC);
      a.loop = true;
      a.preload = 'auto';
      a.volume = 0;
      a.addEventListener('pause', () => setPlaying(false));
      a.addEventListener('play', () => setPlaying(true));
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  const fadeTo = useCallback((target: number, ms: number, done?: () => void) => {
    const a = audioRef.current;
    if (!a) return;
    cancelAnimationFrame(fadeRef.current);
    const from = a.volume;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      a.volume = Math.max(0, Math.min(1, from + (target - from) * k));
      if (k < 1) fadeRef.current = requestAnimationFrame(step);
      else done?.();
    };
    fadeRef.current = requestAnimationFrame(step);
  }, []);

  const play = useCallback(async () => {
    const a = ensure();
    try {
      await a.play();
      fadeTo(volumeRef.current, 1800);
    } catch {
      setPlaying(false);
    }
  }, [ensure, fadeTo]);

  const pause = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    setPlaying(false);
    fadeTo(0, 600, () => a.pause());
  }, [fadeTo]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (a && !a.paused) pause();
    else void play();
  }, [pause, play]);

  const setVolume = useCallback((v: number) => {
    volumeRef.current = v;
    setVolumeState(v);
    try {
      localStorage.setItem(STORE_KEY, String(v));
    } catch {
      /* storage unavailable */
    }
    const a = audioRef.current;
    if (a && !a.paused) {
      cancelAnimationFrame(fadeRef.current);
      a.volume = v;
    }
  }, []);

  useEffect(
    () => () => {
      cancelAnimationFrame(fadeRef.current);
      audioRef.current?.pause();
    },
    [],
  );

  return { playing, volume, play, pause, toggle, setVolume };
}

export type AudioApi = ReturnType<typeof useAudio>;
