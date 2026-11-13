import { useCallback, useEffect, useRef, useState } from 'react';
import { About } from './components/About';
import { Atmosphere } from './components/Atmosphere';
import { Contact } from './components/Contact';
import { Events } from './components/Events';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { Gallery } from './components/Gallery';
import { Gate } from './components/Gate';
import { Hero } from './components/Hero';
import { MusicControl } from './components/MusicControl';
import { Nav } from './components/Nav';
import { PaintingMap } from './components/PaintingMap';
import { Registration } from './components/Registration';
import { Results } from './components/Results';
import { Scene } from './components/Scene';
import { Schedule } from './components/Schedule';
import { Sponsors } from './components/Sponsors';
import { Venue } from './components/Venue';
import { Wishes } from './components/Wishes';
import { useActiveSection } from './hooks/useActiveSection';
import { useAudio } from './hooks/useAudio';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useSky } from './hooks/useSky';
import { sfx } from './lib/sfx';

/* every section in page order: a chime marks the passage from one to the next */
const SECTIONS = ['home', 'wishes', 'about', 'map', 'events', 'schedule', 'register', 'results', 'venue', 'sponsors', 'gallery', 'faq', 'contact'] as const;
const HOVER_TARGETS = '.btn, .event-card__button, .frame button, .map__place, .map__list a, .plaque > a, .wish button';

export default function App() {
  const reducedMotion = useReducedMotion();
  const audio = useAudio();
  const sky = useSky();
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const section = useActiveSection(SECTIONS);
  const firstSection = useRef(true);

  /* Never leave a visitor stuck on the loader if the artwork is slow. */
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 6000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('is-gated', !entered);
    if (!entered) window.scrollTo(0, 0);
  }, [entered]);

  /* sound effects follow the music toggle and its volume */
  useEffect(() => {
    sfx.setEnabled(audio.playing);
    if (audio.playing) sfx.unlock();
  }, [audio.playing]);
  useEffect(() => sfx.setVolume(audio.volume), [audio.volume]);

  useEffect(() => {
    if (!entered) return;
    if (firstSection.current) {
      firstSection.current = false;
      return;
    }
    sfx.chime(SECTIONS.indexOf(section as (typeof SECTIONS)[number]), 0.035);
  }, [section, entered]);

  useEffect(() => {
    let last: Element | null = null;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const target = (e.target as Element | null)?.closest?.(HOVER_TARGETS) ?? null;
      if (target && target !== last) sfx.hover();
      last = target;
    };
    document.addEventListener('pointerover', onOver, { passive: true });
    return () => document.removeEventListener('pointerover', onOver);
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const onEnter = useCallback(
    (withSound: boolean) => {
      /* Called inside the click handler, so the browser allows playback. */
      if (withSound) {
        sfx.unlock();
        void audio.play();
      }
      setEntered(true);
    },
    [audio],
  );

  return (
    <>
      <Scene entered={entered} reducedMotion={reducedMotion} onReady={onReady} />
      <a className="skip" href="#wishes">
        Skip to content
      </a>
      <Nav visible={entered} />
      <main inert={!entered}>
        <Hero entered={entered} />
        <Wishes />
        <About />
        <PaintingMap />
        <Events entered={entered} />
        <Schedule />
        <Registration />
        <Results />
        <Venue />
        <Sponsors />
        <Gallery />
        <Faq />
        <Contact />
      </main>
      <div inert={!entered}>
        <Footer sky={sky} />
      </div>
      <Atmosphere reducedMotion={reducedMotion} />
      <MusicControl audio={audio} visible={entered} />
      <Gate ready={ready} onEnter={onEnter} />
    </>
  );
}
