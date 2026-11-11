import { contact, site } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { Pending, SectionHeading } from './Ornaments';

export function Socials({ className }: { className?: string }) {
  return (
    <ul className={`socials ${className ?? ''}`}>
      {contact.socials.map((s) => (
        <li key={s.label}>
          {s.url ? (
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ) : (
            <span className="socials__pending" title="Link to be added">
              {s.label}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Contact() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="contact" className="section contact" ref={ref} aria-labelledby="contact-title">
      <div className="wrap">
        <div className="night contact__panel">
          <SectionHeading
            index="12"
            label="Contact"
            id="contact-title"
            title="Send word to the pavilion."
            intro={`Questions about events, registration or partnerships? The ${site.name} organising committee will help.`}
          />
          <div className="contact__grid">
            <div className="contact__committee" data-reveal>
              <h3 className="contact__sub">Organising committee</h3>
              <ul>
                {contact.committee.map((m, i) => (
                  <li key={i}>
                    <span className="contact__role">{m.role}</span>
                    <span className="contact__name">{m.name}</span>
                    {m.phone ? <a href={`tel:${m.phone.replace(/\s+/g, '')}`}>{m.phone}</a> : <span className="contact__tba">Phone TBA</span>}
                  </li>
                ))}
              </ul>
              <Pending>Committee details to be added</Pending>
            </div>

            <div className="contact__direct" data-reveal>
              <h3 className="contact__sub">Write or call</h3>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : 'Email address TBA'}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>
                    {contact.phone ? <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>{contact.phone}</a> : 'Phone number TBA'}
                  </dd>
                </div>
              </dl>
              <h3 className="contact__sub">Follow the fest</h3>
              <Socials />
              {contact.socials.some((s) => !s.url) ? <Pending>Social links to be added</Pending> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
