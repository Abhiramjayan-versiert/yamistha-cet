import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { events, isPlaceholder, type FestEvent } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { Action, Eave, Pending, SectionHeading } from './Ornaments';

function EventCard({ event, index, onOpen }: { event: FestEvent; index: number; onOpen: (e: FestEvent, el: HTMLElement) => void }) {
  return (
    <li className="event-card" data-reveal style={{ transitionDelay: `${(index % 3) * 90}ms` }}>
      <button
        type="button"
        className="event-card__button"
        onClick={(e) => onOpen(event, e.currentTarget)}
        aria-haspopup="dialog"
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

function EventDetail({ event, onClose }: { event: FestEvent; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
            <Action href={event.registrationUrl} variant="primary" pendingLabel="Registration link coming soon">
              Register for this event
            </Action>
            <button type="button" className="btn btn--ink" onClick={onClose}>
              Back to all events
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function Events() {
  const ref = useReveal<HTMLElement>();
  const [selected, setSelected] = useState<FestEvent | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((event: FestEvent, el: HTMLElement) => {
    openerRef.current = el;
    setSelected(event);
  }, []);
  const close = useCallback(() => {
    setSelected(null);
    openerRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section id="events" className="section events" ref={ref} aria-labelledby="events-title">
      <div className="wrap">
        <SectionHeading
          index="02"
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
        <ul className="events__grid">
          {events.map((event, i) => (
            <EventCard key={event.slug} event={event} index={i} onOpen={open} />
          ))}
        </ul>
      </div>
      {selected ? <EventDetail event={selected} onClose={close} /> : null}
    </section>
  );
}
