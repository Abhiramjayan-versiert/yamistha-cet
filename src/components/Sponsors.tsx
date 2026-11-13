import { partnerTiers, sponsorshipContact } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { Action, Pending, SectionHeading } from './Ornaments';

export function Sponsors() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="sponsors" className="section sponsors" ref={ref} aria-labelledby="sponsors-title">
      <div className="wrap">
        <SectionHeading
          index="09"
          label="Sponsors and Partners"
          id="sponsors-title"
          align="center"
          title="Those who keep the lanterns lit."
          intro={
            <>
              With thanks to the organisations that make the fest possible.{' '}
              <Pending>Partners to be announced</Pending>
            </>
          }
        />
        <div className="sponsors__tiers">
          {partnerTiers.map((tier) => (
            <div className={`tier tier--${tier.size}`} key={tier.tier} data-reveal>
              <h3 className="tier__name">
                <i />
                {tier.tier}
                <i />
              </h3>
              <ul className="tier__list">
                {tier.partners.map((p, i) => {
                  const inner = p.logo ? (
                    <img src={p.logo} alt={p.name} loading="lazy" />
                  ) : (
                    <>
                      <span className="plaque__name">{p.name}</span>
                      <span className="plaque__hint">Logo placeholder</span>
                    </>
                  );
                  return (
                    <li className="plaque" key={i}>
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer">
                          {inner}
                        </a>
                      ) : (
                        <div>{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="sponsors__cta" data-reveal>
          <Action href={sponsorshipContact.url} variant="ghost" pendingLabel="Sponsorship enquiries: contact to be added">
            Become a Partner
          </Action>
        </div>
      </div>
    </section>
  );
}
