import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { events, isPlaceholder, site, type FestEvent } from '../data/site';
import { sfx } from '../lib/sfx';
import { useReveal } from '../hooks/useReveal';
import { Action, Eave, Pending, SectionHeading } from './Ornaments';

function EventCard({ event, index, onOpen }: { event: FestEvent; index: number; onOpen: (e: FestEvent, el: HTMLElement) => void }) {
  return (
    <li className="event-card" style={{ animationDelay: `${(index % 3) * 90}ms` }}>
      <button
        type="button"
        className="event-card__button"
        onClick={(e) => onOpen(event, e.currentTarget)}
        aria-haspopup="dialog"
        data-href={eventPath(event.slug)}
      >
        <span className="event-card__art">
          <img src={`/art/${event.art}.webp`} alt="" loading="lazy" width={720} height={540} />
        </span>
        <Eave className="event-card__eave" />
        <span className="event-card__body">
          <span className="event-card__category">{event.category}</span>
          <span className="event-card__name">{event.name}</span>
          <span className="event-card__summary">{event.summary}</span>
          <span className="event-card__meta">
            <span>{event.dateTime}</span>
            <span>{event.teamSize}</span>
          </span>
          <span className="event-card__more">
            View details
            <i aria-hidden="true" />
          </span>
        </span>
      </button>
    </li>
  );
}

export const eventPath = (slug: string) => `/events/${slug}`;

function slugFromLocation(): string | null {
  const m = window.location.pathname.match(/^\/events\/([^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]) : null;
}

function EventDetail({ event, onClose }: { event: FestEvent; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [shareNote, setShareNote] = useState('');

  const share = async () => {
    const url = `${window.location.origin}${eventPath(event.slug)}`;
    const data = { title: `${event.name} | ${site.name} ${site.year}`, text: event.summary, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote('Link copied.');
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') setShareNote(url);
    }
  };

  useEffect(() => {
    closeRef.current?.focus();
    document.body.classList.add('dialog-open');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('dialog-open');
    };
  }, [onClose]);

  const facts = [
    { label: 'Date and time', value: event.dateTime },
    { label: 'Venue', value: event.venue },
    { label: 'Day', value: event.day },
    { label: 'Format', value: event.format },
    { label: 'Team size', value: event.teamSize },
    { label: 'Eligibility', value: event.eligibility },
  ];
  const sample = isPlaceholder(event.category);

  /* rendered at the top of the document so it sits above the navigation */
  return createPortal(
    <div className="detail" role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={onClose}>
      <div className="detail__panel" ref={panelRef} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="detail__close" onClick={onClose} aria-label="Close event details">
          <span />
          <span />
        </button>
        <div className="detail__art">
          <img src={`/art/${event.art}.webp`} alt="" width={720} height={540} />
          <Eave className="detail__eave" />
        </div>
        <div className="detail__body">
          <p className="detail__category">{event.category}</p>
          <h3 className="detail__title" id="detail-title">
            {event.name}
          </h3>
          {sample ? (
            <p className="detail__notice">
              <Pending>Placeholder event</Pending> The details below are sample text. Update them in{' '}
              <code>src/data/site.ts</code>.
            </p>
          ) : null}
          <p className="detail__description">{event.description}</p>

          <dl className="detail__facts">
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          <h4 className="detail__sub">Rules</h4>
          <ol className="detail__rules">
            {event.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>

          <h4 className="detail__sub">Event coordinator</h4>
          <p className="detail__coordinator">
            {event.coordinator.name}
            <span>{event.coordinator.contact}</span>
          </p>

          <div className="detail__actions">
            {event.registrationUrl ? (
              <Action href={event.registrationUrl} variant="primary" pendingLabel="">
                Register for this event
              </Action>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('yamishta:register', { detail: event.slug }));
                  window.setTimeout(() => document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' }), 60);
                }}
              >
                Register for this event
              </button>
            )}
            <button type="button" className="btn btn--ink" onClick={share}>
              Share this event
            </button>
            <button type="button" className="btn btn--ink" onClick={onClose}>
              All events
            </button>
          </div>
          <p className="detail__share" role="status">
            {shareNote}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const unique = (values: string[]) => Array.from(new Set(values));

function FilterGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="filters__group" role="group" aria-label={`Filter by ${label.toLowerCase()}`}>
      <span className="filters__label">{label}</span>
      {['All', ...options].map((o) => (
        <button key={o} type="button" className={value === o ? 'is-active' : ''} aria-pressed={value === o} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function Events({ entered }: { entered: boolean }) {
  const ref = useReveal<HTMLElement>();
  const [slug, setSlug] = useState<string | null>(slugFromLocation);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [day, setDay] = useState('All');
  const [format, setFormat] = useState('All');
  const openerRef = useRef<HTMLElement | null>(null);
  const deepLinked = useRef(slug !== null);

  const selected = entered ? (events.find((e) => e.slug === slug) ?? null) : null;

  /* every event has its own address, so it can be shared and opened directly */
  useEffect(() => {
    const onPop = () => setSlug(slugFromLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    document.title = selected
      ? `${selected.name} | ${site.name} ${site.year}`
      : `${site.name} ${site.year} | ${site.descriptor}, ${site.host}`;
  }, [selected]);

  /* arriving on a shared link: bring the events section into view behind the details */
  useEffect(() => {
    if (entered && deepLinked.current) {
      deepLinked.current = false;
      document.getElementById('events')?.scrollIntoView({ behavior: 'auto' });
    }
  }, [entered]);

  const open = useCallback((event: FestEvent, el: HTMLElement) => {
    openerRef.current = el;
    window.history.pushState({ event: event.slug }, '', eventPath(event.slug));
    setSlug(event.slug);
    sfx.chime(4, 0.05);
  }, []);
  const close = useCallback(() => {
    window.history.pushState({}, '', '/');
    setSlug(null);
    openerRef.current?.focus({ preventScroll: true });
  }, []);

  const q = query.trim().toLowerCase();
  const visible = events.filter(
    (e) =>
      (category === 'All' || e.category === category) &&
      (day === 'All' || e.day === day) &&
      (format === 'All' || e.format === format) &&
      (!q || `${e.name} ${e.category} ${e.summary} ${e.description}`.toLowerCase().includes(q)),
  );
  const filtered = q !== '' || category !== 'All' || day !== 'All' || format !== 'All';
  const reset = () => {
    setQuery('');
    setCategory('All');
    setDay('All');
    setFormat('All');
  };

  return (
    <section id="events" className="section events" ref={ref} aria-labelledby="events-title">
      <div className="wrap">
        <SectionHeading
          index="04"
          label="Events"
          id="events-title"
          align="center"
          title="Choose your summit."
          intro={
            <>
              Every competition at the fest has its own card. Open one for the format, rules, eligibility and
              registration. <Pending>Event list to be announced</Pending>
            </>
          }
        />

        <div className="filters" data-reveal>
          <div className="filters__search">
            <label htmlFor="event-search">Search events</label>
            <input
              id="event-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or keyword"
              autoComplete="off"
            />
          </div>
          <div className="filters__groups">
            <FilterGroup label="Category" options={unique(events.map((e) => e.category))} value={category} onChange={setCategory} />
            <FilterGroup label="Day" options={unique(events.map((e) => e.day))} value={day} onChange={setDay} />
            <FilterGroup label="Format" options={unique(events.map((e) => e.format))} value={format} onChange={setFormat} />
          </div>
          <p className="filters__status" role="status">
            Showing {visible.length} of {events.length} events
            {filtered ? (
              <button type="button" onClick={reset}>
                Clear filters
              </button>
            ) : null}
          </p>
        </div>

        {visible.length > 0 ? (
          <ul className="events__grid">
            {visible.map((event, i) => (
              <EventCard key={event.slug} event={event} index={i} onOpen={open} />
            ))}
          </ul>
        ) : (
          <p className="events__none">No events match those filters.</p>
        )}
      </div>
      {selected ? <EventDetail event={selected} onClose={close} /> : null}
    </section>
  );
}
