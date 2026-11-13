import { useEffect, useMemo, useState } from 'react';
import { schedule, type ScheduleItem } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { downloadIcs, googleCalendarUrl } from '../lib/calendar';
import { parseIst } from '../lib/time';
import { Pending, SectionHeading } from './Ornaments';

/* A lantern on the path: each stop on the timeline is marked with one. */
function Lantern() {
  return (
    <svg className="stop__lantern" viewBox="0 0 28 40" aria-hidden="true" focusable="false">
      <path className="stop__lantern-roof" d="M1 9c5 1 9-2 13-7 4 5 8 8 13 7l-3 4H4z" />
      <rect className="stop__lantern-body" x="6" y="13" width="16" height="17" rx="1.5" />
      <path className="stop__lantern-frame" d="M14 13v17M6 21.500h16" />
      <path className="stop__lantern-roof" d="M4 30h20l-2 4H6z" />
      <path className="stop__lantern-frame" d="M14 34v5" />
    </svg>
  );
}

type Timed = { item: ScheduleItem; day: number; start: number; end: number };

function untilText(ms: number): string {
  const mins = Math.max(1, Math.round(ms / 60000));
  if (mins < 60) return `in ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `in ${hours} h ${mins % 60} min`;
  const days = Math.floor(hours / 24);
  return `in ${days} ${days === 1 ? 'day' : 'days'}`;
}

export function Schedule() {
  const ref = useReveal<HTMLElement>();
  const [now, setNow] = useState(() => Date.now());

  /* every stop that has a real start time, in order */
  const timed = useMemo<Timed[]>(
    () =>
      schedule
        .flatMap((d, day) =>
          d.items.map((item) => {
            const start = parseIst(item.start);
            return start === null ? null : { item, day, start, end: parseIst(item.end) ?? start + 60 * 60 * 1000 };
          }),
        )
        .filter((t): t is Timed => t !== null)
        .sort((a, b) => a.start - b.start),
    [],
  );

  useEffect(() => {
    if (timed.length === 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [timed]);

  const live = timed.filter((t) => now >= t.start && now < t.end);
  const next = timed.find((t) => t.start > now);
  const over = timed.length > 0 && !next && live.length === 0;

  /* open on the day that is under way, or the day of the next stop */
  const [day, setDay] = useState(() => live[0]?.day ?? next?.day ?? 0);
  const current = schedule[day];

  return (
    <section id="schedule" className="section schedule" ref={ref} aria-labelledby="schedule-title">
      <div className="wrap">
        <div className="night schedule__panel">
          <SectionHeading
            index="05"
            label="Schedule"
            id="schedule-title"
            title="Follow the lantern path."
            intro={
              <>
                The fest, hour by hour. Each lantern marks a stop along the way.{' '}
                {timed.length === 0 ? <Pending>Timings to be announced</Pending> : null}
              </>
            }
          />

          {timed.length > 0 && !over ? (
            <div className="nowstrip" role="status" data-reveal>
              {live.length > 0 ? (
                <p className="nowstrip__live">
                  <span className="nowstrip__pulse" aria-hidden="true" />
                  <span className="nowstrip__label">Happening now</span>
                  <strong>{live.map((l) => l.item.event).join(', ')}</strong>
                  <span>{live[0].item.venue}</span>
                </p>
              ) : null}
              {next ? (
                <p className="nowstrip__next">
                  <span className="nowstrip__label">Next</span>
                  <strong>{next.item.event}</strong>
                  <span>
                    {untilText(next.start - now)}, {next.item.venue}
                  </span>
                </p>
              ) : null}
            </div>
          ) : null}
          {timed.length === 0 ? (
            <p className="schedule__hint" data-reveal>
              Once timings are set, each stop can be added to your calendar and the path shows what is happening now.
            </p>
          ) : null}

          <div className="schedule__tabs" role="tablist" aria-label="Fest days" data-reveal>
            {schedule.map((d, i) => (
              <button
                key={d.label}
                type="button"
                role="tab"
                id={`day-tab-${i}`}
                aria-selected={day === i}
                aria-controls="day-panel"
                className={day === i ? 'is-active' : ''}
                onClick={() => setDay(i)}
              >
                <span className="schedule__tab-label">{d.label}</span>
                <span className="schedule__tab-date">{d.date}</span>
              </button>
            ))}
          </div>

          <ol className="path" id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${day}`} key={day}>
            {current.items.map((item, i) => {
              const start = parseIst(item.start);
              const end = start === null ? null : (parseIst(item.end) ?? start + 60 * 60 * 1000);
              const isLive = start !== null && end !== null && now >= start && now < end;
              const isPast = end !== null && now >= end;
              const entry = item.start ? { title: item.event, location: item.venue, start: item.start, end: item.end } : null;
              const google = entry ? googleCalendarUrl(entry) : null;
              return (
                <li
                  className={`stop ${isLive ? 'is-live' : ''} ${isPast ? 'is-past' : ''}`}
                  key={i}
                  style={{ animationDelay: `${i * 110}ms` }}
                >
                  <Lantern />
                  <div className="stop__card">
                    <p className="stop__time">
                      <span className="stop__date">{current.date}</span>
                      {item.time}
                      {isLive ? <span className="stop__now">Now</span> : null}
                    </p>
                    <h3 className="stop__event">{item.event}</h3>
                    <p className="stop__venue">{item.venue}</p>
                    {entry && google && !isPast ? (
                      <p className="stop__calendar">
                        <span>Add to calendar</span>
                        <a href={google} target="_blank" rel="noopener noreferrer">
                          Google
                        </a>
                        <button type="button" onClick={() => downloadIcs(entry)}>
                          Apple or Outlook
                        </button>
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
