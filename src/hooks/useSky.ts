import { useEffect, useState } from 'react';

export type SkyPhase = 'dawn' | 'day' | 'dusk' | 'night';
export type SkyMode = 'auto' | SkyPhase;

const KEY = 'yamishta-sky';
export const SKY_MODES: SkyMode[] = ['auto', 'dawn', 'day', 'dusk', 'night'];

function phaseForHour(hour: number): SkyPhase {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19.5) return 'dusk';
  return 'night';
}

function readMode(): SkyMode {
  try {
    const v = localStorage.getItem(KEY) as SkyMode | null;
    if (v && SKY_MODES.includes(v)) return v;
  } catch {
    /* storage unavailable */
  }
  return 'auto';
}

/*
 * The painting follows the visitor's own clock: rose light at dawn, the
 * painting as painted by day, violet at dusk and deep teal at night with
 * brighter lamps. A visitor can also hold the sky at any one phase.
 */
export function useSky() {
  const [mode, setModeState] = useState<SkyMode>(readMode);
  const [clock, setClock] = useState(() => phaseForHour(new Date().getHours() + new Date().getMinutes() / 60));

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(phaseForHour(d.getHours() + d.getMinutes() / 60));
    };
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const phase: SkyPhase = mode === 'auto' ? clock : mode;

  useEffect(() => {
    document.documentElement.dataset.sky = phase;
  }, [phase]);

  const setMode = (next: SkyMode) => {
    setModeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable */
    }
  };

  return { mode, phase, setMode };
}

export type SkyApi = ReturnType<typeof useSky>;
