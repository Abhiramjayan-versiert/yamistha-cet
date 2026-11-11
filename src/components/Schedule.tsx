import { useState } from 'react';
import { schedule } from '../data/site';
import { useReveal } from '../hooks/useReveal';
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

export function Schedule() {
  const ref = useReveal<HTMLElement>();
  const [day, setDay] = useState(0);
  const current = schedule[day];

  return (
    <section id="schedule" className="section schedule" ref={ref} aria-labelledby="schedule-title">
      <div className="wrap">
        <div className="night schedule__panel">
          <SectionHeading
            index="03"
            label="Schedule"
            id="schedule-title"
            title="Follow the lantern path."
            intro={
              <>
                The fest, hour by hour. Each lantern marks a stop along the way.{' '}
                <Pending>Timings to be announced</Pending>
              </>
            }
          />

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
            {current.items.map((item, i) => (
              <li className="stop" key={i} style={{ animationDelay: `${i * 110}ms` }}>
                <Lantern />
                <div className="stop__card">
                  <p className="stop__time">
                    <span className="stop__date">{current.date}</span>
                    {item.time}
                  </p>
                  <h3 className="stop__event">{item.event}</h3>
                  <p className="stop__venue">{item.venue}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
