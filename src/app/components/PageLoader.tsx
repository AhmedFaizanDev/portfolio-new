"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CHAR_PIXELS, type PixelChar } from "./PixelMark";

/**
 * The site's page loader and transitions, drawn in the same 22px grid as the background.
 *  - First visit: FAIZAN types itself in dot-matrix, then bursts into pixels while the
 *    cover dissolves outward. Once per visitor, skippable with any click or key.
 *  - Every internal link: cells flip on in a wave from the click point, the route
 *    changes behind the cover, then the wave flips them off to reveal the new page.
 */

const GRID = 22;
const POP = 110; // ms a cell glows in the accent colour after it flips
const COVER_MS = 280;
const REVEAL_MS = 360;
const WORD: PixelChar[] = ["F", "A", "I", "Z", "A", "N"];
const FIRST_VISIT_KEY = "faizan-intro-seen-v2";

// Read once per page load, so a remounted effect (React dev StrictMode) can't
// see its own write and skip the intro.
let firstVisitCache: boolean | null = null;
function isFirstVisit(): boolean {
  if (firstVisitCache === null) {
    try {
      firstVisitCache = !localStorage.getItem(FIRST_VISIT_KEY);
      localStorage.setItem(FIRST_VISIT_KEY, "1");
    } catch {
      firstVisitCache = false;
    }
  }
  return firstVisitCache;
}

type Wave = { kind: "cover" | "reveal"; start: number; ox: number; oy: number; spread: number; done?: () => void };
type Particle = { x: number; y: number; vx: number; vy: number; size: number };

export default function PageLoader() {
  const router = useRouter();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ssrCover, setSsrCover] = useState(true);
  const [active, setActive] = useState(false);
  const engine = useRef<{
    cover: (x: number, y: number, done: () => void) => void;
    reveal: (x: number, y: number) => void;
    busy: () => boolean;
  } | null>(null);
  const pending = useRef<{ href: string; x: number; y: number; timer: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0, height = 0, cols = 0, rows = 0;
    let jitter = new Float32Array(0);
    let wave: Wave | null = null;
    let covered = false;
    let intro: { start: number; burstAt: number | null } | null = null;
    let particles: Particle[] = [];
    let raf = 0;

    const size = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / GRID) + 1;
      rows = Math.ceil(height / GRID) + 1;
      jitter = Float32Array.from({ length: cols * rows }, () => Math.random());
    };

    const colors = () => {
      const s = getComputedStyle(document.documentElement);
      return {
        fill: s.getPropertyValue("--site-canvas-fill").trim() || "#061329",
        accent: s.getPropertyValue("--site-accent").trim() || "#8fd0f2",
        grid: s.getPropertyValue("--site-canvas-grid").trim() || "rgba(2, 8, 20, 0.34)",
      };
    };

    const drawCell = (c: number, r: number, fill: string, grid: string) => {
      ctx.fillStyle = fill;
      ctx.fillRect(c * GRID, r * GRID, GRID, GRID);
      ctx.fillStyle = grid;
      ctx.fillRect(c * GRID, r * GRID, GRID, 1);
      ctx.fillRect(c * GRID, r * GRID, 1, GRID);
    };

    // Letter pixels for the intro, centred; shrink on narrow screens.
    const letterLayout = () => {
      const px = Math.max(6, Math.min(GRID, Math.floor((width * 0.82) / 35)));
      const x0 = Math.round(width / 2 - (35 * px) / 2);
      const y0 = Math.round(height / 2 - 2 * px);
      return WORD.flatMap((ch, li) =>
        (CHAR_PIXELS[ch] as readonly number[]).map((i) => ({ li, x: x0 + (li * 6 + (i % 5)) * px, y: y0 + Math.floor(i / 5) * px, px }))
      );
    };

    const frame = (now: number) => {
      raf = 0;
      const { fill, accent, grid } = colors();
      ctx.clearRect(0, 0, width, height);
      let animating = false;

      if (wave) {
        const t = now - wave.start;
        const maxDist = Math.hypot(Math.max(wave.ox, width - wave.ox), Math.max(wave.oy, height - wave.oy));
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const d = Math.hypot(c * GRID + GRID / 2 - wave.ox, r * GRID + GRID / 2 - wave.oy);
            const p = t - ((d / maxDist) * wave.spread + jitter[r * cols + c] * 60);
            const on = wave.kind === "cover" ? p >= 0 : p < 0;
            if (on) drawCell(c, r, fill, grid);
            if (p >= 0 && p < POP) {
              ctx.fillStyle = accent;
              ctx.globalAlpha = (1 - p / POP) * (wave.kind === "cover" ? 0.55 : 0.3);
              ctx.fillRect(c * GRID + 1, r * GRID + 1, GRID - 1, GRID - 1);
              ctx.globalAlpha = 1;
            }
          }
        }
        if (t > wave.spread + POP + 60) {
          const done = wave.done;
          covered = wave.kind === "cover";
          wave = null;
          done?.();
        } else animating = true;
      } else if (covered || (intro && intro.burstAt === null)) {
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) drawCell(c, r, fill, grid);
      }

      if (intro) {
        const t = now - intro.start;
        if (intro.burstAt === null) {
          // FAIZAN types itself, one letter every 90ms.
          for (const p of letterLayout()) {
            const a = Math.min(1, Math.max(0, (t - p.li * 90) / 70));
            if (!a) continue;
            ctx.fillStyle = accent;
            ctx.globalAlpha = a;
            ctx.fillRect(p.x + 1, p.y + 1, p.px - 2, p.px - 2);
          }
          ctx.globalAlpha = 1;
          animating = true;
        } else {
          // Burst: letter pixels fly outward and fade while the cover dissolves.
          const bt = now - intro.burstAt;
          const life = Math.max(0, 1 - bt / 900);
          ctx.fillStyle = accent;
          for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.97;
            p.vy *= 0.97;
            ctx.globalAlpha = life;
            ctx.fillRect(p.x, p.y, p.size, p.size);
          }
          ctx.globalAlpha = 1;
          if (life > 0) animating = true;
          else intro = null;
        }
      }

      if (animating || wave) raf = requestAnimationFrame(frame);
      else if (!covered) setActive(false);
    };

    const kick = () => {
      setActive(true);
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const start = (kind: Wave["kind"], ox: number, oy: number, spread: number, done?: () => void) => {
      wave = { kind, start: performance.now(), ox, oy, spread, done };
      kick();
    };

    const burst = () => {
      if (!intro || intro.burstAt !== null) return;
      intro.burstAt = performance.now();
      particles = letterLayout().map((p) => {
        const ang = Math.atan2(p.y - height / 2, p.x - width / 2) + (Math.random() - 0.5) * 0.9;
        const speed = 4 + Math.random() * 9;
        return { x: p.x, y: p.y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, size: p.px - 2 };
      });
      start("reveal", width / 2, height / 2, 620);
    };

    size();
    const onResize = () => {
      size();
      if (raf === 0 && covered) kick();
    };
    window.addEventListener("resize", onResize);

    engine.current = {
      cover: (x, y, done) => (reduced ? done() : start("cover", x, y, COVER_MS, done)),
      reveal: (x, y) => {
        if (reduced) {
          covered = false;
          ctx.clearRect(0, 0, width, height);
          setActive(false);
          return;
        }
        start("reveal", x, y, REVEAL_MS);
      },
      busy: () => wave !== null || covered || intro !== null,
    };

    // First paint: the SSR cover is up. Hand over to the canvas, then play the intro
    // (first visit) or a quick reveal (every later load).
    const firstVisit = isFirstVisit();

    let introTimer = 0;
    let failsafe = 0;
    const skip = () => burst();
    // Hand over from the SSR cover inside a frame: draw the canvas first, then drop
    // the div, so there is never a frame with the page uncovered.
    const handover = requestAnimationFrame((now) => {
      if (reduced) return setSsrCover(false);
      if (firstVisit) {
        intro = { start: now, burstAt: null };
        const go = () => window.setTimeout(burst, Math.max(0, 1100 - (performance.now() - now)));
        if (document.readyState === "complete") introTimer = go();
        else window.addEventListener("load", () => (introTimer = go()), { once: true });
        failsafe = window.setTimeout(burst, 3200); // never hold a slow load hostage
        window.addEventListener("pointerdown", skip, { once: true });
        window.addEventListener("keydown", skip, { once: true });
      } else {
        covered = true;
        wave = { kind: "reveal", start: now, ox: width / 2, oy: height / 2, spread: REVEAL_MS };
      }
      frame(now);
      setActive(true);
      setSsrCover(false);
    });

    // Programmatic navigation (the terminal) gets the same dissolve from screen centre.
    const onNavigate = (e: Event) => {
      const href = (e as CustomEvent<string>).detail;
      if (wave || covered || intro) return;
      const x = width / 2, y = height / 2;
      engine.current?.cover(x, y, () => {
        const timer = window.setTimeout(() => {
          pending.current = null;
          engine.current?.reveal(x, y);
        }, 3000);
        pending.current = { href, x, y, timer };
        router.push(href);
      });
    };
    window.addEventListener("pixel:navigate", onNavigate);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(handover);
      window.clearTimeout(introTimer);
      window.clearTimeout(failsafe);
      window.removeEventListener("pixel:navigate", onNavigate);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("resize", onResize);
      engine.current = null;
    };
  }, [router]);

  // Intercept internal navigation: cover first, then route, then reveal on arrival.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as HTMLElement | null)?.closest("a");
      if (!link || !link.href || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      const api = engine.current;
      if (!api) return;
      event.preventDefault();
      if (api.busy()) return;
      const href = url.pathname + url.search + url.hash;
      const { clientX: x, clientY: y } = event;
      api.cover(x, y, () => {
        const timer = window.setTimeout(() => {
          pending.current = null;
          engine.current?.reveal(x, y);
        }, 3000);
        pending.current = { href, x, y, timer };
        router.push(href);
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    window.clearTimeout(p.timer);
    // Give the new page a frame to paint under the cover.
    requestAnimationFrame(() => engine.current?.reveal(p.x, p.y));
  }, [pathname]);

  return (
    <>
      {ssrCover ? <div className="pixel-cover fixed inset-0 z-[10000]" style={{ background: "var(--site-canvas-fill)" }} aria-hidden="true" /> : null}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 z-[10000] ${active ? "" : "pointer-events-none invisible"}`}
        aria-hidden="true"
      />
    </>
  );
}
