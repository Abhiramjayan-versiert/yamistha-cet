import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gallery, type GalleryItem } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { Blossom, Pending, SectionHeading } from './Ornaments';

/* An empty mount, shown wherever a real photograph has not been supplied yet. */
function Mount({ item }: { item: GalleryItem }) {
  return (
    <span className="mount">
      <Blossom className="mount__mark" />
      <span className="mount__caption">{item.caption}</span>
      <span className="mount__hint">Awaiting photograph</span>
    </span>
  );
}

function Lightbox({ index, onClose, onStep }: { index: number; onClose: () => void; onStep: (d: number) => void }) {
  const item = gallery[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
    document.body.classList.add('dialog-open');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('dialog-open');
    };
  }, [onClose, onStep]);

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.caption}, ${index + 1} of ${gallery.length}`}
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) onStep(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <button ref={closeRef} type="button" className="lightbox__close" onClick={onClose} aria-label="Close gallery view">
        <span />
        <span />
      </button>
      <button
        type="button"
        className="lightbox__step lightbox__step--prev"
        aria-label="Previous photograph"
        onClick={(e) => {
          e.stopPropagation();
          onStep(-1);
        }}
      />
      <figure className="lightbox__figure" key={index} onClick={(e) => e.stopPropagation()}>
        <div className={`lightbox__frame lightbox__frame--${item.shape}`}>
          {item.src ? <img src={item.src} alt={item.alt} /> : <Mount item={item} />}
        </div>
        <figcaption>
          <span>{item.caption}</span>
          <span>
            {index + 1} / {gallery.length}
          </span>
        </figcaption>
      </figure>
      <button
        type="button"
        className="lightbox__step lightbox__step--next"
        aria-label="Next photograph"
        onClick={(e) => {
          e.stopPropagation();
          onStep(1);
        }}
      />
    </div>,
    document.body,
  );
}

export function Gallery() {
  const ref = useReveal<HTMLElement>();
  const [open, setOpen] = useState<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    openerRef.current?.focus({ preventScroll: true });
  }, []);
  const step = useCallback((d: number) => {
    setOpen((i) => (i === null ? i : (i + d + gallery.length) % gallery.length));
  }, []);

  return (
    <section id="gallery" className="section gallery" ref={ref} aria-labelledby="gallery-title">
      <div className="wrap">
        <SectionHeading
          index="10"
          label="Gallery"
          id="gallery-title"
          title="Scenes from the fest."
          intro={
            <>
              Photographs from the fest will hang here. <Pending>Awaiting real photographs</Pending>
            </>
          }
        />
        <ul className="gallery__grid">
          {gallery.map((item, i) => (
            <li key={i} className={`frame frame--${item.shape}`} data-reveal style={{ transitionDelay: `${(i % 4) * 70}ms` }}>
              <button
                type="button"
                onClick={(e) => {
                  openerRef.current = e.currentTarget;
                  setOpen(i);
                }}
                aria-label={`Open ${item.caption} in full screen`}
              >
                {item.src ? <img src={item.src} alt={item.alt} loading="lazy" /> : <Mount item={item} />}
                <span className="frame__open" aria-hidden="true">
                  View
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {open !== null ? <Lightbox index={open} onClose={close} onStep={step} /> : null}
    </section>
  );
}
