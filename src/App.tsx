import { useCallback, useEffect, useState } from 'react';
import { About } from './components/About';
import { Atmosphere } from './components/Atmosphere';
import { Contact } from './components/Contact';
import { Events } from './components/Events';
import { Footer } from './components/Footer';
import { Gallery } from './components/Gallery';
import { Gate } from './components/Gate';
import { Hero } from './components/Hero';
import { MusicControl } from './components/MusicControl';
import { Nav } from './components/Nav';
import { Registration } from './components/Registration';
import { Scene } from './components/Scene';
import { Schedule } from './components/Schedule';
import { Sponsors } from './components/Sponsors';
import { Venue } from './components/Venue';
import { useAudio } from './hooks/useAudio';
import { useReducedMotion } from './hooks/useReducedMotion';

export default function App() {
  const reducedMotion = useReducedMotion();
  const audio = useAudio();
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);

  /* Never leave a visitor stuck on the loader if the artwork is slow. */
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 6000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('is-gated', !entered);
    if (!entered) window.scrollTo(0, 0);
  }, [entered]);

  const onReady = useCallback(() => setReady(true), []);
  const onEnter = useCallback(
    (withSound: boolean) => {
      /* Called inside the click handler, so the browser allows playback. */
      if (withSound) void audio.play();
      setEntered(true);
    },
    [audio],
  );

  return (
    <>
      <Scene entered={entered} reducedMotion={reducedMotion} onReady={onReady} />
      <a className="skip" href="#about">
        Skip to content
      </a>
      <Nav visible={entered} />
      <main inert={!entered}>
        <Hero entered={entered} />
        <About />
        <Events />
        <Schedule />
        <Registration />
        <Venue />
        <Sponsors />
        <Gallery />
        <Contact />
      </main>
      <div inert={!entered}>
        <Footer />
      </div>
      <Atmosphere reducedMotion={reducedMotion} />
      <MusicControl audio={audio} visible={entered} />
      <Gate ready={ready} onEnter={onEnter} />
    </>
  );
}
