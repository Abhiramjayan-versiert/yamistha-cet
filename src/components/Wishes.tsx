import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useReveal } from '../hooks/useReveal';
import { sfx } from '../lib/sfx';
import {
  MAX_WISH_LENGTH,
  cleanWish,
  fetchSharedWishes,
  loadMyWishes,
  saveMyWishes,
  sendSharedWish,
  sharedWishes,
  type Wish,
} from '../lib/wishes';
import { SectionHeading } from './Ornaments';

function LanternShape() {
  return (
    <svg viewBox="0 0 40 56" aria-hidden="true" focusable="false">
      <path className="wish__cap" d="M11 5h18l3 5H8z" />
      <path className="wish__glow" d="M8 10h24c4 9 4 24 0 33H8c-4-9-4-24 0-33z" />
      <path className="wish__rib" d="M14 10c-2.500 9-2.500 24 0 33M20 10v33M26 10c2.500 9 2.500 24 0 33" />
      <path className="wish__cap" d="M10 43h20l-3 5H13z" />
      <path className="wish__rib" d="M20 48v7" />
    </svg>
  );
}

/* a steady pseudo random number from a string, so each lantern keeps its place */
function seeded(id: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

export function Wishes() {
  const ref = useReveal<HTMLElement>();
  const [mine, setMine] = useState<Wish[]>(loadMyWishes);
  const [shared, setShared] = useState<Wish[]>([]);
  const [text, setText] = useState('');
  const [flying, setFlying] = useState<{ id: string; text: string } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!sharedWishes) return;
    fetchSharedWishes()
      .then(setShared)
      .catch(() => setNotice('Shared lanterns could not be loaded just now.'));
  }, []);

  const lanterns = useMemo(() => [...mine, ...shared].slice(0, 36), [mine, shared]);

  const release = async (e: FormEvent) => {
    e.preventDefault();
    const wish = cleanWish(text);
    if (!wish || flying) return;
    const entry: Wish = { id: `m-${Date.now().toString(36)}`, text: wish, mine: true };
    const next = [entry, ...mine].slice(0, 24);
    setMine(next);
    saveMyWishes(next);
    setText('');
    setFlying({ id: entry.id, text: wish });
    sfx.wind(3.2, 0.08);
    sfx.chime(3, 0.06);
    window.setTimeout(() => setFlying(null), 7200);
    if (sharedWishes) {
      const ok = await sendSharedWish(wish).catch(() => false);
      setNotice(
        ok
          ? 'Your lantern is on its way. It will appear for everyone once the committee approves it.'
          : 'Your lantern is kept on this device. It could not be sent to the shared sky.',
      );
    } else {
      setNotice('Your lantern has been released. It is kept on this device only.');
    }
  };

  const clearMine = () => {
    setMine([]);
    saveMyWishes([]);
    setOpen(null);
    setNotice('Your lanterns have been cleared from this device.');
  };

  return (
    <section id="wishes" className="section wishes" ref={ref} aria-labelledby="wishes-title">
      <div className="wrap">
        <div className="night wishes__panel">
          <div className="wishes__intro">
            <SectionHeading
              index="10"
              label="Wish Lanterns"
              id="wishes-title"
              title="Release a lantern."
              intro="Write a wish for the fest and let it rise over the mountains."
            />
            <form className="wishes__form" onSubmit={release} data-reveal>
              <label htmlFor="wish-text">Your wish</label>
              <div className="wishes__field">
                <input
                  id="wish-text"
                  type="text"
                  value={text}
                  maxLength={MAX_WISH_LENGTH}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="May our pitch land well"
                  autoComplete="off"
                />
                <span className="wishes__count" aria-hidden="true">
                  {text.length}/{MAX_WISH_LENGTH}
                </span>
              </div>
              <button type="submit" className="btn btn--primary" disabled={!cleanWish(text) || Boolean(flying)}>
                Release lantern
              </button>
              <p className="wishes__privacy">
                {sharedWishes
                  ? 'Wishes are reviewed by the committee before they appear for other visitors. Please do not include personal details.'
                  : 'Lanterns are stored in this browser only. Nothing you write here is sent anywhere or shown to other visitors.'}
              </p>
              <p className="wishes__notice" role="status">
                {notice}
              </p>
            </form>
          </div>

          <div className="wishes__sky" data-reveal>
            {lanterns.length === 0 ? (
              <p className="wishes__empty">The sky is waiting for its first lantern.</p>
            ) : (
              <ul>
                {lanterns.map((w) => (
                  <li
                    key={w.id}
                    className={`wish ${open === w.id ? 'is-open' : ''} ${w.mine ? 'wish--mine' : ''}`}
                    style={{
                      left: `${6 + seeded(w.id, 1) * 82}%`,
                      top: `${8 + seeded(w.id, 2) * 62}%`,
                      animationDelay: `${-seeded(w.id, 3) * 9}s`,
                      animationDuration: `${7 + seeded(w.id, 4) * 6}s`,
                      ['--size' as string]: `${30 + seeded(w.id, 5) * 16}px`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(open === w.id ? null : w.id)}
                      onMouseEnter={() => setOpen(w.id)}
                      onMouseLeave={() => setOpen(null)}
                      onBlur={() => setOpen(null)}
                      aria-label={`${w.mine ? 'Your wish' : 'A wish'}: ${w.text}`}
                    >
                      <LanternShape />
                    </button>
                    <span className={`wish__text ${seeded(w.id, 1) > 0.6 ? 'wish__text--left' : ''}`} aria-hidden="true">
                      {w.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {mine.length > 0 ? (
              <button type="button" className="wishes__clear" onClick={clearMine}>
                Clear my lanterns
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {flying ? (
        <div className="wish-flight" aria-hidden="true" key={flying.id}>
          <div className="wish-flight__lantern">
            <LanternShape />
            <span>{flying.text}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
