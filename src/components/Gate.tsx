import { useEffect, useRef, useState } from 'react';
import { site } from '../data/site';
import { Crescent } from './Ornaments';

type Props = {
  ready: boolean;
  onEnter: (withSound: boolean) => void;
};

/*
 * The opening screen. The painting is already alive behind it (snow,
 * petals, clouds). The visitor steps in through ENTER YAMISHTA, which is
 * also the user gesture that lets the browser start the soundtrack.
 */
export function Gate({ ready, onEnter }: Props) {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ready) buttonRef.current?.focus({ preventScroll: true });
  }, [ready]);

  const enter = (withSound: boolean) => {
    if (leaving) return;
    setLeaving(true);
    onEnter(withSound);
    window.setTimeout(() => setGone(true), 1500);
  };

  if (gone) return null;

  return (
    <div
      className={`gate ${ready ? 'is-ready' : ''} ${leaving ? 'is-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Welcome to ${site.name} ${site.year}`}
    >
      <div className="gate__loader" aria-hidden={ready}>
        <Crescent className="gate__loader-moon" />
        <span>Opening the scroll</span>
      </div>

      <div className="gate__content">
        <p className="gate__host">{site.host}</p>
        <h1 className="gate__title" aria-label={`${site.name} ${site.year}`}>
          <span className="gate__name" aria-hidden="true">
            {site.name.split('').map((ch, i) => (
              <span key={i} style={{ animationDelay: `${0.5 + i * 0.09}s` }}>
                {ch}
              </span>
            ))}
          </span>
          <span className="gate__year" aria-hidden="true">
            <i />
            {site.year}
            <i />
          </span>
        </h1>
        <p className="gate__descriptor">{site.descriptor}</p>

        <button ref={buttonRef} type="button" className="gate__enter" onClick={() => enter(true)} disabled={!ready}>
          <span className="gate__enter-text">Enter {site.name}</span>
        </button>
        <p className="gate__hint">
          Music begins when you enter.{' '}
          <button type="button" className="gate__silent" onClick={() => enter(false)} disabled={!ready}>
            Enter in silence
          </button>
        </p>
      </div>
    </div>
  );
}
