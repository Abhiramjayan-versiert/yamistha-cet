import { navLinks, site } from '../data/site';
import { Socials } from './Contact';
import { Crescent, Eave } from './Ornaments';

export function Footer() {
  return (
    <footer className="footer">
      {/* an open view of the painting before the page comes to rest */}
      <div className="footer__vista" aria-hidden="true" />
      <div className="footer__ground">
        <Eave className="footer__eave" />
        <div className="wrap footer__inner">
          <div className="footer__brand">
            <Crescent className="footer__moon" />
            <p className="footer__name">
              {site.name} <span>{site.year}</span>
            </p>
            <p className="footer__line">{site.descriptor}</p>
            <p className="footer__line">{site.host}</p>
          </div>
          <nav className="footer__nav" aria-label="Footer">
            {navLinks.map((l) => (
              <a key={l.id} href={`#${l.id}`}>
                {l.label}
              </a>
            ))}
            <a href="#register">Register</a>
          </nav>
          <div className="footer__social">
            <p className="footer__label">Follow</p>
            <Socials />
          </div>
        </div>
        <p className="footer__copy">
          &copy; {site.year} {site.name}, {site.host}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
