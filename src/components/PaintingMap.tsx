import { useEffect, useState } from 'react';
import { places, secretReward, secrets } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { sfx } from '../lib/sfx';
import { SectionHeading } from './Ornaments';

const KEY = 'yamishta-secrets';

function readFound(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((id) => secrets.some((s) => s.id === id)) : [];
  } catch {
    return [];
  }
}

/*
 * The whole painting as a map. Marked places lead to sections of the
 * website. A few unmarked details keep secrets of their own.
 */
export function PaintingMap() {
  const ref = useReveal<HTMLElement>();
  const [hot, setHot] = useState<string | null>(null);
  const [found, setFound] = useState<string[]>(readFound);
  const [whisper, setWhisper] = useState<string | null>(null);
  const complete = found.length === secrets.length;

  useEffect(() => {
    if (!whisper) return;
    const t = window.setTimeout(() => setWhisper(null), 4200);
    return () => window.clearTimeout(t);
  }, [whisper]);

  const discover = (id: string, message: string) => {
    setWhisper(message);
    sfx.chime(found.length + 2, 0.07);
    window.dispatchEvent(new CustomEvent('yamishta:bloom'));
    if (found.includes(id)) return;
    const next = [...found, id];
    setFound(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    if (next.length === secrets.length) sfx.wind(3, 0.08);
  };

  return (
    <section id="map" className="section map" ref={ref} aria-labelledby="map-title">
      <div className="wrap map__grid">
        <figure className="map__painting" data-reveal="wipe">
          <div className="map__canvas">
            <img src="/art/painting.webp" alt="The YAMISHTA painting: a pavilion among cherry blossoms beneath mountains, clouds and a crescent moon" loading="lazy" width={980} height={1749} />
            {secrets.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`map__secret ${found.includes(s.id) ? 'is-found' : ''}`}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                onClick={() => discover(s.id, s.found)}
                aria-label={found.includes(s.id) ? `Secret found: ${s.found}` : 'A detail in the painting'}
              />
            ))}
            {places.map((p, i) => (
              <a
                key={p.id}
                href={`#${p.target}`}
                className={`map__place ${hot === p.id ? 'is-hot' : ''}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                onMouseEnter={() => setHot(p.id)}
                onMouseLeave={() => setHot(null)}
                onFocus={() => setHot(p.id)}
                onBlur={() => setHot(null)}
                aria-label={`${p.name}: go to ${p.note}`}
              >
                <span className="map__dot" aria-hidden="true">
                  {i + 1}
                </span>
                <span className={`map__tip ${p.x > 60 ? 'map__tip--left' : ''}`} aria-hidden="true">
                  <strong>{p.name}</strong>
                  {p.note}
                </span>
              </a>
            ))}
            <p className={`map__whisper ${whisper ? 'is-shown' : ''}`} role="status">
              {whisper}
            </p>
          </div>
        </figure>

        <div className="night map__legend">
          <SectionHeading
            index="02"
            label="The Painting"
            id="map-title"
            title="Wander the painting."
            intro="Every place in the painting leads somewhere. Choose a lantern on the map, or a name from the list."
          />
          <ol className="map__list" data-reveal>
            {places.map((p, i) => (
              <li key={p.id}>
                <a
                  href={`#${p.target}`}
                  className={hot === p.id ? 'is-hot' : ''}
                  onMouseEnter={() => setHot(p.id)}
                  onMouseLeave={() => setHot(null)}
                  onFocus={() => setHot(p.id)}
                  onBlur={() => setHot(null)}
                >
                  <span className="map__num">{i + 1}</span>
                  <span className="map__name">{p.name}</span>
                  <span className="map__note">{p.note}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="map__secrets" data-reveal>
            <p>
              Some details in the painting keep secrets. Look closely.
              <span className="map__count" aria-label={`${found.length} of ${secrets.length} secrets found`}>
                {secrets.map((s) => (
                  <i key={s.id} className={found.includes(s.id) ? 'is-found' : ''} />
                ))}
              </span>
            </p>
            {complete ? (
              <div className="map__reward" role="status">
                <strong>{secretReward.title}</strong>
                <span>{secretReward.text}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
