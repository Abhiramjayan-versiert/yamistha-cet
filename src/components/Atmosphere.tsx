import { useEffect, useRef } from 'react';

/*
 * Winter air: continuous snowfall with depth, plus the occasional cherry
 * blossom petal let go by the trees. One fixed canvas, no libraries.
 *
 * Performance notes
 * - Particle counts scale with the viewport area and shrink on small or
 *   low powered devices.
 * - The loop measures its own frame time and thins the snow if the
 *   device cannot keep up.
 * - The loop stops while the tab is hidden.
 * - With reduced motion the canvas paints a single still frame.
 */

type Flake = {
  x: number;
  y: number;
  z: number; // 0 far, 1 near
  r: number;
  vy: number;
  sway: number;
  swaySpeed: number;
  phase: number;
  alpha: number;
  crystal: boolean;
  rot: number;
  spin: number;
};

type Petal = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  flip: number;
  flipSpeed: number;
  phase: number;
  tone: number;
  alpha: number;
  wait: number;
};

/* Blossom tones sampled from the painting. */
const PETAL_TONES = ['#e9b3ae', '#d98f8c', '#f3cdc6', '#c9737a'];
const SNOW = '252, 244, 232';

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function Atmosphere({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const cores = navigator.hardwareConcurrency || 4;
    const lowPower = coarse || cores <= 4;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let flakes: Flake[] = [];
    let petals: Petal[] = [];
    let density = 1;
    let frame = 0;
    let last = 0;
    let slowFrames = 0;
    let time = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    const makeFlake = (anywhere: boolean): Flake => {
      const z = Math.pow(Math.random(), 1.6);
      const crystal = z > 0.72 && Math.random() < 0.3;
      return {
        x: rand(-40, w + 40),
        y: anywhere ? rand(-20, h) : rand(-60, -8),
        z,
        r: crystal ? rand(3.2, 5.2) : 0.7 + z * 2.5,
        vy: 16 + z * 52 + rand(-4, 6),
        sway: 8 + z * 22,
        swaySpeed: rand(0.25, 0.8),
        phase: rand(0, Math.PI * 2),
        alpha: 0.32 + z * 0.55,
        crystal,
        rot: rand(0, Math.PI),
        spin: rand(-0.7, 0.7),
      };
    };

    const makePetal = (first: boolean): Petal => {
      /* Most petals leave from the upper left, where the great branch hangs. */
      const fromBranch = Math.random() < 0.7;
      return {
        x: fromBranch ? rand(-30, w * 0.45) : rand(0, w),
        y: fromBranch ? rand(-30, h * 0.22) : -30,
        size: rand(7, 13) * (w < 700 ? 0.85 : 1),
        vx: rand(14, 34),
        vy: rand(20, 38),
        rot: rand(0, Math.PI * 2),
        spin: rand(-1.1, 1.1),
        flip: rand(0, Math.PI * 2),
        flipSpeed: rand(1.2, 2.6),
        phase: rand(0, Math.PI * 2),
        tone: Math.floor(Math.random() * PETAL_TONES.length),
        alpha: rand(0.75, 0.95),
        wait: first ? rand(0, 14) : rand(2, 16),
      };
    };

    const populate = () => {
      const area = (w * h) / (1440 * 900);
      const base = lowPower ? 70 : 150;
      const count = Math.round(Math.min(220, Math.max(36, base * area)) * density);
      flakes = Array.from({ length: count }, () => makeFlake(true));
      const petalCount = reducedMotion ? 0 : w < 700 ? 5 : 9;
      petals = Array.from({ length: petalCount }, () => makePetal(true));
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      populate();
      if (reducedMotion) paint(0);
    };

    const drawCrystal = (f: Flake) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.strokeStyle = `rgba(${SNOW}, ${f.alpha})`;
      ctx.lineWidth = 0.9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI) / 3;
        const cx = Math.cos(a) * f.r;
        const cy = Math.sin(a) * f.r;
        ctx.moveTo(-cx, -cy);
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
      ctx.restore();
    };

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.cos(p.flip)));
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = PETAL_TONES[p.tone];
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5);
      ctx.bezierCurveTo(s * 0.55, -s * 0.45, s * 0.5, s * 0.3, 0, s * 0.55);
      ctx.bezierCurveTo(-s * 0.5, s * 0.3, -s * 0.55, -s * 0.45, 0, -s * 0.5);
      ctx.fill();
      /* a single darker vein, in the manner of the painted blossoms */
      ctx.strokeStyle = 'rgba(150, 70, 84, 0.45)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.3);
      ctx.lineTo(0, s * 0.4);
      ctx.stroke();
      ctx.restore();
    };

    const paint = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      /* a slow breath of wind that every particle shares */
      const wind = Math.sin(time * 0.13) * 9 + Math.sin(time * 0.041 + 1.7) * 7 + 5;

      for (const f of flakes) {
        if (dt > 0) {
          f.phase += f.swaySpeed * dt;
          f.y += f.vy * dt;
          f.x += (Math.cos(f.phase) * f.sway + wind * (0.4 + f.z)) * dt;
          if (f.crystal) f.rot += f.spin * dt;
          if (pointer.active) {
            const dx = f.x - pointer.x;
            const dy = f.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 12100 && d2 > 1) {
              const d = Math.sqrt(d2);
              const push = (1 - d / 110) * 70 * (0.4 + f.z) * dt;
              f.x += (dx / d) * push;
              f.y += (dy / d) * push;
            }
          }
          if (f.y > h + 10 || f.x < -60 || f.x > w + 60) {
            Object.assign(f, makeFlake(false));
            if (f.x < -40 || f.x > w + 40) f.x = rand(0, w);
          }
        }
        if (f.crystal) {
          drawCrystal(f);
        } else {
          ctx.fillStyle = `rgba(${SNOW}, ${f.alpha})`;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (const p of petals) {
        if (p.wait > 0) {
          p.wait -= dt;
          continue;
        }
        p.phase += dt;
        p.flip += p.flipSpeed * dt;
        p.rot += p.spin * dt;
        p.x += (p.vx + wind * 1.4 + Math.sin(p.phase * 1.3) * 16) * dt;
        p.y += (p.vy + Math.cos(p.phase * 0.9) * 10) * dt;
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 16900 && d2 > 1) {
            const d = Math.sqrt(d2);
            const push = (1 - d / 130) * 120 * dt;
            p.x += (dx / d) * push;
            p.y += (dy / d) * push;
            p.spin += (dx > 0 ? 1 : -1) * dt * 2;
          }
        }
        if (p.y > h + 30 || p.x > w + 40) Object.assign(p, makePetal(false));
        drawPetal(p);
      }
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const elapsed = last ? now - last : 16;
      last = now;
      const dt = Math.min(0.05, elapsed / 1000);
      time += dt;
      /* adaptive quality: thin the snowfall if frames run long */
      if (elapsed > 26) slowFrames += 1;
      else if (slowFrames > 0) slowFrames -= 0.25;
      if (slowFrames > 45 && density > 0.4) {
        density *= 0.7;
        slowFrames = 0;
        flakes.length = Math.max(24, Math.round(flakes.length * 0.7));
      }
      paint(dt);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (!document.hidden && !reducedMotion) frame = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    if (!reducedMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onPointerLeave);
      frame = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="atmosphere" aria-hidden="true" />;
}
