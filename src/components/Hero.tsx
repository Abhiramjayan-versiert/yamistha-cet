import { site } from '../data/site';

export function Hero({ entered }: { entered: boolean }) {
  return (
    <section id="home" className={`hero ${entered ? 'is-entered' : ''}`} aria-label="Home">
      <div className="hero__inner">
        <p className="hero__host">{site.host}</p>
        <h1 className="hero__title">
          <span className="hero__name">{site.name}</span>
          <span className="hero__seal" aria-label={site.year}>
            <span aria-hidden="true">{site.year.slice(0, 2)}</span>
            <span aria-hidden="true">{site.year.slice(2)}</span>
          </span>
        </h1>
        <p className="hero__descriptor">
          <i />
          {site.descriptor}
          <i />
        </p>
        <p className="hero__tagline">{site.tagline}</p>
        <p className="hero__dates">{site.dates}</p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#events">
            Explore Events
          </a>
          <a className="btn btn--ghost" href="#register">
            Register Now
          </a>
        </div>
      </div>
      <a className="hero__scroll" href="#about" aria-label="Scroll to About">
        <span>Descend</span>
        <i />
      </a>
    </section>
  );
}
