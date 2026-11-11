import { useEffect, useRef } from 'react';

/*
 * The living backdrop. The reference painting is the whole world of the
 * website: this component fixes it behind the page and moves a camera
 * over it. Before entry the camera rests on the pavilion. On entry it
 * rises through the clouds to the moon, and from then on it travels
 * back down the painting as the visitor scrolls, arriving at the
 * pavilion again by the footer.
 *
 * Every child is positioned in percentages of the artwork (816 x 1456),
 * so the moon glow, the swaying branch and the drifting clouds stay
 * registered to the painting at every screen size.
 */

const ART_W = 816;
const ART_H = 1456;
const RISE_MS = 3200;
const SCRIM_MAX = 0.58;

type Props = {
  entered: boolean;
  reducedMotion: boolean;
  onReady: () => void;
};

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* Cloud sprites cut from the painting itself. Positions are in artwork percent. */
const CLOUDS = [
  { art: 'cloud-a', top: 13.5, width: 30, duration: 210, delay: -40, opacity: 0.96, flip: false },
  { art: 'cloud-b', top: 24, width: 42, duration: 280, delay: -170, opacity: 0.95, flip: false },
  { art: 'cloud-a', top: 36.5, width: 24, duration: 240, delay: -120, opacity: 0.92, flip: true },
  { art: 'cloud-b', top: 47, width: 34, duration: 320, delay: -260, opacity: 0.9, flip: true },
  { art: 'cloud-a', top: 58, width: 27, duration: 260, delay: -15, opacity: 0.9, flip: false },
];

export function Scene({ entered, reducedMotion, onReady }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const enteredRef = useRef(entered);
  const enteredAtRef = useRef(0);

  useEffect(() => {
    if (entered && !enteredRef.current) enteredAtRef.current = performance.now();
    enteredRef.current = entered;
  }, [entered]);

  useEffect(() => {
    const stage = stageRef.current;
    const drift = driftRef.current;
    const scrim = scrimRef.current;
    if (!stage || !drift || !scrim) return;

    let vw = 0;
    let vh = 0;
    let range = 0;
    let gate = 0;
    let cam = -1;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let frame = 0;

    const layout = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      const width = Math.max(vw * 1.04, vh * (ART_W / ART_H) * 1.28);
      const height = (width * ART_H) / ART_W;
      stage.style.width = `${width}px`;
      stage.style.height = `${height}px`;
      stage.style.left = `${(vw - width) / 2}px`;
      range = height - vh;
      /* Rest the camera so the pavilion sits just below the middle of the screen. */
      gate = clamp((0.69 * height - vh * 0.56) / range);
    };

    const scrollProgress = () => {
      const max = document.documentElement.scrollHeight - vh;
      return max > 0 ? clamp(window.scrollY / max) : 0;
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      let target: number;
      let scrimTarget = 0;
      if (!enteredRef.current) {
        target = gate;
        cam = gate;
      } else {
        const since = now - enteredAtRef.current;
        const p = scrollProgress();
        if (reducedMotion) {
          target = 0;
          cam = 0;
        } else if (since < RISE_MS) {
          target = gate * (1 - easeInOut(since / RISE_MS));
          cam = target;
        } else {
          target = p;
        }
        /* Dim the painting behind the reading sections, then let it clear for the footer. */
        const max = document.documentElement.scrollHeight - vh;
        const fromTop = clamp(window.scrollY / (vh * 0.85));
        const fromEnd = clamp((max - window.scrollY) / (vh * 0.7));
        scrimTarget = SCRIM_MAX * fromTop * (0.3 + 0.7 * fromEnd);
      }
      if (cam < 0) cam = target;
      cam += (target - cam) * 0.075;
      px += (tx - px) * 0.05;
      py += (ty - py) * 0.05;
      stage.style.transform = `translate3d(${(-px * 16).toFixed(2)}px, ${(-cam * range - py * 8).toFixed(2)}px, 0)`;
      drift.style.transform = `translate3d(${(-px * 22).toFixed(2)}px, ${(-py * 10).toFixed(2)}px, 0)`;
      scrim.style.opacity = scrimTarget.toFixed(3);
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || reducedMotion) return;
      tx = e.clientX / vw - 0.5;
      ty = e.clientY / vh - 0.5;
    };
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };

    layout();
    frame = requestAnimationFrame(tick);
    window.addEventListener('resize', layout);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', layout);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion]);

  return (
    <div className="scene" aria-hidden="true">
      <div className="scene__stage" ref={stageRef}>
        <img
          className="scene__art"
          src="/art/scene-1632.webp"
          srcSet="/art/scene-816.webp 816w, /art/scene-1632.webp 1632w"
          sizes="(max-aspect-ratio: 3/4) 135vw, 104vw"
          alt=""
          decoding="async"
          fetchPriority="high"
          onLoad={onReady}
          onError={onReady}
        />
        <div className="scene__moon" />
        <div className="scene__drift" ref={driftRef}>
          {CLOUDS.map((c, i) => (
            <span
              key={i}
              className="scene__cloud"
              style={{
                top: `${c.top}%`,
                opacity: c.opacity,
                animationDuration: `${c.duration}s`,
                animationDelay: `${c.delay}s`,
              }}
            >
              <img
                src={`/art/${c.art}.webp`}
                alt=""
                style={{ width: `${c.width}%`, transform: c.flip ? 'scaleX(-1)' : undefined }}
              />
            </span>
          ))}
        </div>
        <img className="scene__branch" src="/art/branch.webp" alt="" decoding="async" />
        <div className="scene__lantern scene__lantern--hall" />
        <div className="scene__lantern scene__lantern--door" />
      </div>
      <div className="scene__sky" />
      <div className="scene__scrim" ref={scrimRef} />
    </div>
  );
}
