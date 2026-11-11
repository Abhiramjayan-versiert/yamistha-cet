import { useState } from 'react';
import { announcements } from '../data/site';

const KEY = 'yamishta-dismissed';

function readDismissed(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/* A thin notice above the navigation. A visitor can dismiss each notice once. */
export function Announcement({ onNavigate }: { onNavigate?: () => void }) {
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);
  const current = announcements.find((a) => !dismissed.includes(a.id));
  if (!current) return null;

  const dismiss = () => {
    const next = [...dismissed, current.id];
    setDismissed(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <div className="announce" role="region" aria-label="Announcement">
      <p className="announce__text">
        <span className="announce__mark" aria-hidden="true" />
        {current.text}
        {current.href ? (
          <a href={current.href} onClick={onNavigate} {...(/^https?:/.test(current.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {current.linkLabel ?? 'Read more'}
          </a>
        ) : null}
      </p>
      <button type="button" className="announce__close" onClick={dismiss} aria-label="Dismiss announcement">
        <span />
        <span />
      </button>
    </div>
  );
}
