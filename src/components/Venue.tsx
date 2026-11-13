import { venue } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { Crescent, Pending, SectionHeading } from './Ornaments';

export function Venue() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="venue" className="section venue" ref={ref} aria-labelledby="venue-title">
      <div className="wrap venue__grid">
        <div className="paper venue__text">
          <SectionHeading index="08" label="Venue" id="venue-title" tone="dark" title="Where the path leads." />
          <address className="venue__address" data-reveal>
            <strong>{venue.institution}</strong>
            <span>{venue.locality}</span>
            <span>{venue.region}</span>
          </address>
          <p className="venue__halls" data-reveal>
            {venue.halls} <Pending>Editable placeholder</Pending>
          </p>
          <dl className="venue__travel" data-reveal>
            {venue.travel.map((t) => (
              <div key={t.label}>
                <dt>{t.label}</dt>
                <dd>{t.value}</dd>
              </div>
            ))}
          </dl>
          <a className="btn btn--primary" href={venue.directionsUrl} target="_blank" rel="noopener noreferrer" data-reveal>
            Get Directions
          </a>
        </div>

        <div className="venue__map" data-reveal="wipe">
          {venue.mapEmbedUrl ? (
            <iframe
              src={venue.mapEmbedUrl}
              title={`Map showing ${venue.institution}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="venue__map-empty">
              <img src="/art/panel-valley.webp" alt="" loading="lazy" width={720} height={720} />
              <div className="venue__pin">
                <Crescent className="venue__pin-mark" />
                <strong>{venue.institution}</strong>
                <span>{venue.locality}</span>
                <Pending>Google Maps embed placeholder</Pending>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
