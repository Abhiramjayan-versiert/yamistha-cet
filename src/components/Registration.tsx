import { registration, site } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { Action, SectionHeading } from './Ornaments';
import { RegistrationForm } from './RegistrationForm';

export function Registration() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="register" className="section register" ref={ref} aria-labelledby="register-title">
      <div className="wrap">
        <div className="register__gate" data-reveal="wipe">
          <img className="register__art" src="/art/panel-range.webp" alt="" loading="lazy" width={1632} height={760} />
          <div className="register__beam" aria-hidden="true" />
          <div className="register__content">
            <SectionHeading
              index="06"
              label="Registration"
              id="register-title"
              align="center"
              title="Take your place at the gate."
              intro={`Register your team for ${site.name} ${site.year}. One form, every event.`}
            />
            <dl className="register__points">
              {registration.points.map((p) => (
                <div key={p.label}>
                  <dt>{p.label}</dt>
                  <dd>{p.value}</dd>
                </div>
              ))}
            </dl>
            <div className="register__actions">
              {site.registrationUrl ? (
                <Action href={site.registrationUrl} pendingLabel="">
                  Register Now
                </Action>
              ) : (
                <a className="btn btn--primary" href="#register-form">
                  {registration.open ? 'Register Now' : 'Registration closed'}
                </a>
              )}
              <Action href={site.brochureUrl} variant="ghost" pendingLabel="Brochure coming soon">
                Download Brochure
              </Action>
            </div>
            <p className="register__note">
              {registration.note}
            </p>
          </div>
        </div>
        {!site.registrationUrl ? (
          <div data-reveal>
            <RegistrationForm />
          </div>
        ) : null}
      </div>
    </section>
  );
}
