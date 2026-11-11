import { useEffect, useState } from 'react';
import { site } from '../data/site';
import { parseIst } from '../lib/time';

const UNITS = ['Days', 'Hours', 'Minutes', 'Seconds'] as const;

function split(ms: number): string[] {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) =>
    String(n).padStart(2, '0'),
  );
}

/* Four paper lanterns counting down to the opening of the fest. */
export function Countdown() {
  const target = parseIst(site.startsAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (target === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (target !== null && now >= target) {
    return (
      <p className="countdown countdown--live" role="status">
        The fest has begun.
      </p>
    );
  }

  const values = target === null ? UNITS.map(() => '··') : split(target - now);
  const label =
    target === null
      ? 'Countdown begins once the dates are announced'
      : `${Number(values[0])} days, ${Number(values[1])} hours and ${Number(values[2])} minutes until the fest begins`;

  return (
    <div className={`countdown ${target === null ? 'countdown--pending' : ''}`} role="timer" aria-label={label}>
      {UNITS.map((unit, i) => (
        <div className="countdown__lantern" key={unit} aria-hidden="true">
          <span className="countdown__value">{values[i]}</span>
          <span className="countdown__unit">{unit}</span>
        </div>
      ))}
    </div>
  );
}
