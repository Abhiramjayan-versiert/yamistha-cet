import { useEffect, useRef, useState } from 'react';
import type { AudioApi } from '../hooks/useAudio';

/*
 * A small lacquered lantern in the corner. Tap to play or pause the
 * soundtrack. The volume slider opens beside it on hover, on focus,
 * or with the dedicated volume button on touch screens.
 */
export function MusicControl({ audio, visible }: { audio: AudioApi; visible: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`music ${visible ? 'is-visible' : ''} ${audio.playing ? 'is-playing' : ''} ${open ? 'is-open' : ''}`}
    >
      <div className="music__panel">
        <label className="music__label" htmlFor="music-volume">
          Volume
        </label>
        <input
          id="music-volume"
          className="music__slider"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={audio.volume}
          onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
          style={{ ['--fill' as string]: `${audio.volume * 100}%` }}
          tabIndex={visible ? 0 : -1}
        />
      </div>
      <button
        type="button"
        className="music__more"
        aria-label="Volume"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        tabIndex={visible ? 0 : -1}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 8h3l4-3.5v11L6 12H3z" fill="currentColor" />
          <path d="M13 7.2c1.2 1.6 1.2 4 0 5.6M15.2 5c2.4 2.8 2.4 7.200 0 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        className="music__toggle"
        onClick={audio.toggle}
        aria-pressed={audio.playing}
        aria-label={audio.playing ? 'Pause music' : 'Play music'}
        title={audio.playing ? 'Pause music' : 'Play music'}
        tabIndex={visible ? 0 : -1}
      >
        <span className="music__bars" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
    </div>
  );
}
