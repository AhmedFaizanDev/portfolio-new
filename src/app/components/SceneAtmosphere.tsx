"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";

/** Cursor position as springy values in [-1, 1]; stays at 0 on touch or reduced motion. */
export function usePointerDepth(): { x: MotionValue<number>; y: MotionValue<number> } {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 50, damping: 18 });
  const sy = useSpring(y, { stiffness: 50, damping: 18 });
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: MouseEvent) => {
      x.set((e.clientX / window.innerWidth) * 2 - 1);
      y.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);
  return { x: sx, y: sy };
}

export type Phase = "dawn" | "day" | "dusk" | "night";

const subscribeMinute = (tick: () => void) => {
  const id = window.setInterval(tick, 60_000);
  return () => window.clearInterval(id);
};
function hyderabadPhase(): Phase {
  const [h, m] = new Date()
    .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    .split(":")
    .map(Number);
  const t = h + m / 60;
  if (t >= 5 && t < 8) return "dawn";
  if (t >= 8 && t < 17) return "day";
  if (t >= 17 && t < 19.5) return "dusk";
  return "night";
}
/** Time of day where Faizan is; null during SSR so nothing mismatches. */
export function useHyderabadPhase(): Phase | null {
  return useSyncExternalStore(subscribeMinute, hyderabadPhase, () => null);
}

// Light that matches the hour in Hyderabad. Low alpha on purpose: a tint, not a filter.
const TINT: Record<Phase, string> = {
  dawn: "radial-gradient(120% 70% at 80% 100%, rgba(255,170,150,0.18), transparent 60%), linear-gradient(180deg, rgba(255,214,190,0.06), transparent 40%)",
  day: "linear-gradient(180deg, rgba(190,228,255,0.08), transparent 45%)",
  dusk: "radial-gradient(110% 70% at 85% 95%, rgba(255,150,70,0.2), transparent 62%), radial-gradient(80% 50% at 15% 0%, rgba(140,110,220,0.12), transparent 60%)",
  night: "linear-gradient(180deg, rgba(2,6,16,0.35), transparent 55%)",
};

type Flake = { x: number; y: number; size: number; speed: number; sway: number; depth: number };
type Star = { x: number; y: number; phase: number; speed: number };

/**
 * The home scene's weather: pixel snow drifting past the peak, stars when it's
 * night in Hyderabad, and a tint for the hour. Everything is square, like the grid.
 */
export default function SceneAtmosphere({ depth }: { depth: { x: MotionValue<number>; y: MotionValue<number> } }) {
  const phase = useHyderabadPhase();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0, height = 0, raf = 0, last = 0;
    let flakes: Flake[] = [];
    let stars: Star[] = [];

    const size = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      flakes = Array.from({ length: Math.round(Math.min(90, width / 16)) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() < 0.7 ? 2 : 3,
        speed: 0.15 + Math.random() * 0.4,
        sway: Math.random() * Math.PI * 2,
        depth: 0.35 + Math.random() * 0.65,
      }));
      stars = Array.from({ length: Math.round(width / 24) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.55,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0008 + Math.random() * 0.0016,
      }));
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (document.visibilityState === "hidden" || now - last < 33) return;
      last = now;
      const rgb = getComputedStyle(document.documentElement).getPropertyValue("--scene-snow").trim() || "234 246 255";
      const px = depth.x.get() * 26, py = depth.y.get() * 14;
      ctx.clearRect(0, 0, width, height);

      if (phaseRef.current === "night") {
        for (const s of stars) {
          ctx.fillStyle = `rgb(${rgb} / ${0.25 + 0.55 * (0.5 + 0.5 * Math.sin(now * s.speed + s.phase))})`;
          ctx.fillRect(Math.round(s.x + px * 0.2), Math.round(s.y + py * 0.2), 2, 2);
        }
      }
      for (const f of flakes) {
        if (!reduced) {
          f.y += f.speed * f.depth;
          f.x += Math.sin(now * 0.0006 + f.sway) * 0.25 * f.depth;
          if (f.y > height + 4) { f.y = -4; f.x = Math.random() * width; }
        }
        ctx.fillStyle = `rgb(${rgb} / ${0.25 + f.depth * 0.5})`;
        ctx.fillRect(Math.round(f.x + px * f.depth), Math.round(f.y + py * f.depth), f.size, f.size);
      }
    };

    size();
    window.addEventListener("resize", size);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [depth]);

  return (
    <>
      {phase ? <div className="scene-tint absolute inset-0 z-[11] transition-[background] duration-[2000ms]" style={{ background: TINT[phase] }} /> : null}
      <canvas ref={canvasRef} className="absolute inset-0 z-[12] h-full w-full pointer-events-none" />
    </>
  );
}
