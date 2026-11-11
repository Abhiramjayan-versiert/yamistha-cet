import type { ReactNode } from 'react';

/* Small drawn details taken from the painting: the crescent, a blossom, the upturned eave. */

export function Crescent({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        d="M20.5 3.5c3.4 5.2 3.2 13.3-1.4 18.6-3.4 3.9-8.4 5.3-12.9 3.8 3.6 4.5 10.6 5.6 15.7 1.6 6.2-4.9 6.4-15.9-1.4-24z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Blossom({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} transform={`rotate(${a} 16 16)`} d="M16 15c-3.2-2.6-3.6-7.2 0-11 3.6 3.8 3.2 8.4 0 11z" />
        ))}
      </g>
      <circle cx="16" cy="16" r="1.9" fill="var(--cream)" />
    </svg>
  );
}

/* The sweeping roofline of the pavilion, used as a divider and as a cap on cards. */
export function Eave({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 34" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path
        className="eave__tile"
        d="M0 6c26 15 62 20 110 20h180c48 0 84-5 110-20v8c-24 13-60 20-110 20H110C60 34 24 27 0 14z"
      />
      <path className="eave__ridge" d="M0 3c28 14 64 19 110 19h180c46 0 82-5 110-19" fill="none" />
    </svg>
  );
}

type HeadingProps = {
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
  id?: string;
};

export function SectionHeading({ index, label, title, intro, tone = 'light', align = 'left', id }: HeadingProps) {
  return (
    <header className={`heading heading--${tone} heading--${align}`} data-reveal>
      <p className="heading__label">
        <span className="heading__index">{index}</span>
        <span className="heading__rule" />
        {label}
      </p>
      <h2 className="heading__title" id={id}>
        {title}
      </h2>
      {intro ? <p className="heading__intro">{intro}</p> : null}
    </header>
  );
}

/* A clearly visible marker for content the organising team still has to supply. */
export function Pending({ children = 'Placeholder' }: { children?: ReactNode }) {
  return <span className="pending">{children}</span>;
}

type ActionProps = {
  href: string;
  children: ReactNode;
  pendingLabel: string;
  variant?: 'primary' | 'ghost' | 'ink';
  external?: boolean;
  onClick?: () => void;
};

/*
 * A link button that never pretends. When its URL has not been
 * configured it renders as a disabled notice instead of a dead link.
 */
export function Action({ href, children, pendingLabel, variant = 'primary', external = true, onClick }: ActionProps) {
  if (!href) {
    return (
      <span className={`btn btn--${variant} btn--pending`} role="note">
        {pendingLabel}
      </span>
    );
  }
  return (
    <a
      className={`btn btn--${variant}`}
      href={href}
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}
