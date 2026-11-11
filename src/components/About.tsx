import { about, site } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { Blossom, Pending, SectionHeading } from './Ornaments';

export function About() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="about" className="section about" ref={ref} aria-labelledby="about-title">
      <div className="wrap about__grid">
        <figure className="about__window" data-reveal="wipe">
          <img src="/art/panel-pavilion.webp" alt="" loading="lazy" width={920} height={1150} />
          <figcaption>
            <Blossom className="about__window-mark" />
            The pavilion, from the {site.name} {site.year} artwork
          </figcaption>
        </figure>

        <div className="paper about__text">
          <SectionHeading
            index="01"
            label={`About ${site.name}`}
            id="about-title"
            tone="dark"
            title="A management fest, held among the blossoms."
          />
          <p className="about__lead" data-reveal>
            {about.lead}
          </p>
          {about.paragraphs.map((p, i) => (
            <p key={i} className="about__para" data-reveal>
              {p} <Pending>Editable placeholder</Pending>
            </p>
          ))}
          <dl className="about__facts" data-reveal>
            {about.highlights.map((h) => (
              <div key={h.label}>
                <dt>{h.label}</dt>
                <dd>{h.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
