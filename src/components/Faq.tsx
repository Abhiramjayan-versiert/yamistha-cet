import { faqs, isPlaceholder } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { Pending, SectionHeading } from './Ornaments';

export function Faq() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="faq" className="section faq" ref={ref} aria-labelledby="faq-title">
      <div className="wrap faq__wrap">
        <div className="paper faq__panel">
          <SectionHeading
            index="11"
            label="Questions"
            id="faq-title"
            tone="dark"
            title="Before you set out."
            intro="The questions participants ask most often."
          />
          <div className="faq__list" data-reveal>
            {faqs.map((f) => (
              <details className="faq__item" key={f.q}>
                <summary>
                  <span>{f.q}</span>
                  <i aria-hidden="true" />
                </summary>
                <p>
                  {f.a} {isPlaceholder(f.a) ? <Pending>Editable placeholder</Pending> : null}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
