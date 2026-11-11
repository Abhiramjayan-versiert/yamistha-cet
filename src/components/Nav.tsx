import { useEffect, useState } from 'react';
import { moreLinks, navLinks, site } from '../data/site';
import { Announcement } from './Announcement';
import { useActiveSection } from '../hooks/useActiveSection';
import { Crescent, Eave } from './Ornaments';

const IDS = navLinks.map((l) => l.id);

export function Nav({ visible }: { visible: boolean }) {
  const active = useActiveSection(IDS);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onResize = () => window.innerWidth > 1080 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <header className={`nav ${visible ? 'is-visible' : ''} ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <Announcement onNavigate={() => setOpen(false)} />
      <div className="nav__bar">
        <a className="nav__brand" href="#home" onClick={() => setOpen(false)} aria-label={`${site.name} ${site.year}, home`}>
          <Crescent className="nav__brand-moon" />
          <span className="nav__brand-name">{site.name}</span>
          <span className="nav__brand-year">{site.year}</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={active === link.id ? 'is-active' : ''}
              aria-current={active === link.id ? 'true' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a className="btn btn--primary nav__register" href="#register" onClick={() => setOpen(false)}>
          Register
        </a>

        <button
          type="button"
          className="nav__burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <Eave className="nav__eave" />

      <div className="nav__sheet" id="mobile-menu" aria-hidden={!open}>
        <nav aria-label="Mobile">
          {navLinks.map((link, i) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={active === link.id ? 'is-active' : ''}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              style={{ transitionDelay: open ? `${80 + i * 45}ms` : '0ms' }}
            >
              <span className="nav__sheet-index">{String(i + 1).padStart(2, '0')}</span>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="nav__sheet-more">
          {moreLinks.map((link) => (
            <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              {link.label}
            </a>
          ))}
        </div>
        <a className="btn btn--primary nav__sheet-register" href="#register" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          Register Now
        </a>
        <p className="nav__sheet-foot">
          {site.descriptor}
          <br />
          {site.host}
        </p>
      </div>
    </header>
  );
}
