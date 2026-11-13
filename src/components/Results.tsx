import { results, standings } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { Pending, SectionHeading } from './Ornaments';

export function Results() {
  const ref = useReveal<HTMLElement>();
  const ranked = [...standings].sort((a, b) => b.points - a.points);
  const top = ranked[0]?.points || 1;

  return (
    <section id="results" className="section results" ref={ref} aria-labelledby="results-title">
      <div className="wrap">
        <div className="paper results__panel">
          <SectionHeading
            index="07"
            label="Results"
            id="results-title"
            tone="dark"
            title="Names on the summit."
            intro="Winners are posted here as each event concludes."
          />

          {results.length === 0 ? (
            <div className="results__empty" data-reveal>
              <div className="results__podium" aria-hidden="true">
                <span>Second</span>
                <span>First</span>
                <span>Third</span>
              </div>
              <p>
                No results yet. The podium fills once the first event is judged. <Pending>Results to be added</Pending>
              </p>
            </div>
          ) : (
            <ul className="results__list">
              {results.map((r) => (
                <li key={r.event} className="result" data-reveal>
                  <h3 className="result__event">{r.event}</h3>
                  <ol className="result__podium">
                    {r.podium.map((p) => (
                      <li key={p.place} className={`result__place result__place--${p.place.toLowerCase()}`}>
                        <span className="result__rank">{p.place}</span>
                        <span className="result__team">{p.team}</span>
                        <span className="result__college">{p.college}</span>
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ul>
          )}

          {ranked.length > 0 ? (
            <div className="standings" data-reveal>
              <h3 className="standings__title">Overall standings</h3>
              <ol className="standings__list">
                {ranked.map((s, i) => (
                  <li key={s.college}>
                    <span className="standings__rank">{String(i + 1).padStart(2, '0')}</span>
                    <span className="standings__college">{s.college}</span>
                    <span className="standings__bar" aria-hidden="true">
                      <i style={{ width: `${Math.max(4, (s.points / top) * 100)}%` }} />
                    </span>
                    <span className="standings__points">{s.points} pts</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
