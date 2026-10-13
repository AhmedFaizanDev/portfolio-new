"use client";

import { useEffect, useRef } from "react";

/**
 * Small animated pixel illustrations, one per project, drawn on a 40×24 grid in the
 * site's palette. Each scene shows the idea behind the project, not a screenshot.
 * Runs only while visible; reduced motion gets a still frame.
 */

const COLS = 40;
const ROWS = 24;

type Color = "deep" | "solid" | "ice" | "snow" | "live";
type Put = (x: number, y: number, c: Color, a?: number) => void;
type Scene = (put: Put, t: number) => void;

const rect = (put: Put, x: number, y: number, w: number, h: number, c: Color, a = 1) => {
  for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) put(x + i, y + j, c, a);
};
const rand = (n: number) => {
  const x = Math.sin(n * 91.345 + 12.9) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));
const phase = (t: number, period: number) => (t % period) / period;
const within = (p: number, a: number, b: number) => (p - a) / (b - a);

const scenes: Record<string, Scene> = {
  // A +1 delta leaves the base table and patches one group of the view, then a −1 retracts it.
  ivm: (put, t) => {
    const p = phase(t, 4);
    for (let r = 0; r < 6; r++) {
      rect(put, 3, 4 + r * 3, 3, 2, "solid");
      rect(put, 7, 4 + r * 3, 7, 2, "deep");
    }
    const bars = [9, 13, 7];
    const grow = p > 0.5 && p < 0.72 ? 3 : p >= 0.72 && p < 0.92 ? Math.round(lerp(3, 0, within(p, 0.72, 0.92))) : 0;
    bars.forEach((h, i) => {
      const height = h + (i === 1 ? grow : 0);
      rect(put, 25 + i * 4, 21 - height, 3, height, i === 1 && grow ? "ice" : "solid");
    });
    rect(put, 24, 21, 12, 1, "deep");
    if (p > 0.2 && p < 0.5) rect(put, Math.round(lerp(15, 28, within(p, 0.2, 0.5))), 10, 2, 2, "live");
    if (p > 0.62 && p < 0.9) rect(put, Math.round(lerp(15, 28, within(p, 0.62, 0.9))), 16, 2, 2, "ice");
    if (p > 0.5) [[34, 4], [35, 5], [36, 4], [37, 3], [38, 2]].forEach(([x, y]) => put(x, y, "ice", p > 0.95 ? 0.4 : 1));
  },

  // One question, three models; the router lights one path per round and the verifier signs off.
  tinyrouter: (put, t) => {
    const round = Math.floor(t / 3);
    const p = phase(t, 3);
    const pick = [1, 0, 2][round % 3];
    rect(put, 2, 10, 4, 4, "ice");
    rect(put, 12, 10, 4, 4, "solid");
    const ys = [4, 11, 18];
    ys.forEach((y, i) => {
      const lit = i === pick && p > 0.45;
      for (let x = 16; x < 22; x++) put(x, 12, "deep");
      for (let yy = Math.min(12, y + 1); yy <= Math.max(12, y + 1); yy++) put(22, yy, i === pick ? "solid" : "deep");
      for (let x = 22; x < 30; x++) put(x, y + 1, i === pick ? "solid" : "deep");
      rect(put, 30, y, 5, 3, lit ? "ice" : "deep");
    });
    if (p < 0.3) rect(put, Math.round(lerp(6, 11, p / 0.3)), 11, 2, 2, "live");
    else if (p < 0.5) {
      const k = within(p, 0.3, 0.5);
      const y = ys[pick] + 1;
      if (k < 0.5) put(Math.round(lerp(16, 22, k * 2)), 12, "live");
      else put(Math.round(lerp(22, 29, (k - 0.5) * 2)), y, "live");
    }
    if (p > 0.6) [[36, ys[pick] + 1], [37, ys[pick] + 2], [38, ys[pick]]].forEach(([x, y]) => put(x, y, "live"));
  },

  // Three tenants behind one middleware wall: the right request passes, a forged one bounces (403).
  blackgrid: (put, t) => {
    const p = phase(t, 4);
    const towers: [number, number, Color][] = [[24, 10, "deep"], [29, 14, "solid"], [34, 8, "ice"]];
    for (const [x, h, c] of towers) for (let j = 0; j < h; j += 2) rect(put, x, 20 - j, 4, 1, c);
    const flash = p > 0.72 && p < 0.82;
    for (let y = 3; y <= 21; y++) if (y % 3 !== 0) put(20, y, flash ? "live" : "solid");
    if (p < 0.45) {
      const k = p / 0.45;
      const x = Math.round(lerp(2, 30, k));
      const y = x > 20 ? Math.round(lerp(12, 5, within(x, 20, 30))) : 12;
      rect(put, x, y, 2, 2, "solid");
    } else if (p > 0.5 && p < 0.95) {
      const k = within(p, 0.5, 0.95);
      const x = k < 0.5 ? lerp(2, 18, k * 2) : lerp(18, 2, (k - 0.5) * 2);
      rect(put, Math.round(x), 16, 2, 2, "live");
    }
  },

  // A browser the agent drives: fill field one, field two, press the button, download.
  "web-agent": (put, t) => {
    const p = phase(t, 5);
    rect(put, 4, 2, 32, 20, "deep", 0.6);
    rect(put, 4, 2, 32, 2, "solid");
    [6, 8, 10].forEach((x) => put(x, 2, "snow", 0.8));
    rect(put, 8, 7, 20, 2, "deep");
    rect(put, 8, 11, 20, 2, "deep");
    const f1 = Math.round(20 * Math.min(1, within(p, 0.12, 0.32)));
    const f2 = Math.round(20 * Math.min(1, within(p, 0.42, 0.62)));
    if (f1 > 0) rect(put, 8, 7, f1, 2, "ice");
    if (f2 > 0) rect(put, 8, 11, f2, 2, "ice");
    rect(put, 8, 16, 8, 2, p > 0.7 && p < 0.78 ? "ice" : "solid");
    const path: [number, number][] = [[30, 18], [9, 8], [9, 8], [9, 12], [9, 12], [12, 17], [12, 17], [30, 18]];
    const seg = Math.min(path.length - 2, Math.floor(p * (path.length - 1)));
    const k = p * (path.length - 1) - seg;
    const cx = Math.round(lerp(path[seg][0], path[seg + 1][0], k));
    const cy = Math.round(lerp(path[seg][1], path[seg + 1][1], k));
    put(cx, cy, "live");
    put(cx + 1, cy + 1, "live");
    put(cx, cy + 1, "live");
    if (p > 0.78) {
      const dy = Math.round(lerp(0, 4, within(p, 0.78, 1)));
      rect(put, 31, 14 + dy, 1, 3, "live");
      put(30, 16 + dy, "live");
      put(32, 16 + dy, "live");
    }
  },

  // One topic in, a book stacks up page by page, with a checkpoint flag every few pages.
  "content-pipeline": (put, t) => {
    const p = phase(t, 5);
    rect(put, 3, 10, 4, 4, "ice");
    for (let i = 0; i < 6; i++) put(8 + ((Math.floor(t * 12) + i * 2) % 12), 12, "solid", 0.7);
    const pages = Math.floor(p * 16);
    for (let i = 0; i < pages; i++) rect(put, 22, 21 - i, 11, 1, i % 2 ? "solid" : "deep");
    for (let i = 3; i <= pages; i += 4) {
      put(34, 21 - i, "live");
      put(35, 21 - i, "live");
      put(34, 22 - i, "live");
    }
    rect(put, 21, 5, 1, 17, "deep", 0.6);
  },

  // A file assembling from a swarm of peers, every piece hash-checked as it lands.
  pytor: (put, t) => {
    const period = 3.5;
    const p = phase(t, period);
    const peers: [number, number][] = [[4, 4], [34, 4], [4, 19], [34, 19], [2, 11], [36, 11]];
    for (const [x, y] of peers) rect(put, x, y, 2, 2, "deep");
    const pieces = Math.floor(p * 36);
    for (let i = 0; i < 36; i++) put(17 + (i % 6), 9 + Math.floor(i / 6), i < pieces ? "ice" : "deep", i < pieces ? 1 : 0.5);
    for (let k = 0; k < 3; k++) {
      const q = (p * 36 + k * 0.33) % 1;
      const [px, py] = peers[Math.floor(rand(Math.floor(p * 36) + k) * peers.length)];
      put(Math.round(lerp(px, 19, q)), Math.round(lerp(py, 11, q)), "live");
    }
  },

  // A pixel globe with a tanker on its route and a corridor-risk meter beside it.
  trinetra: (put, t) => {
    const cx = 14, cy = 12, r = 9;
    for (let x = cx - r; x <= cx + r; x++)
      for (let y = cy - r; y <= cy + r; y++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d > r) continue;
        const land = rand(x * 7 + y * 13) > 0.62 && d < r - 1;
        put(x, y, land ? "solid" : "deep", land ? 1 : 0.8);
      }
    const route = (k: number): [number, number] => [Math.round(cx - 7 + 14 * k), Math.round(cy + 2 - Math.sin(k * Math.PI) * 6)];
    for (let k = 0; k <= 1; k += 0.07) {
      const [x, y] = route(k);
      put(x, y, "ice", 0.7);
    }
    const [sx, sy] = route(phase(t, 6));
    put(sx, sy, "live");
    put(sx + 1, sy, "live");
    for (let i = 0; i < 4; i++) {
      const h = Math.round(4 + 6 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 1.3)));
      rect(put, 29 + i * 2, 20 - h, 1, h, i === 3 && h > 8 ? "live" : "ice");
    }
  },

  // A glacier scanned by the model: the mask paints ice across the peak, pixel column by column.
  glacier: (put, t) => {
    const scan = Math.round(lerp(4, 38, phase(t, 4)));
    for (let y = 4; y <= 21; y++) {
      const half = y - 4;
      for (let x = 20 - half; x <= 20 + half; x++) {
        if (x < 0 || x >= COLS) continue;
        const iceZone = y < 12 || (y < 16 && Math.abs(x - 20) < 4);
        const masked = iceZone && x < scan;
        put(x, y, masked ? "ice" : y < 8 ? "snow" : (x + y) % 5 === 0 ? "solid" : "deep", masked ? 0.95 : 1);
      }
    }
    for (let y = 2; y <= 22; y++) put(scan, y, "live", 0.8);
  },

  // Two typing rhythms: your own details (quick, even) vs a document number (slow, halting).
  cadence: (put, t) => {
    const p = phase(t, 3.2);
    const fast = Math.floor(p * 32);
    for (let i = 0; i <= Math.min(fast, 15); i++) rect(put, 3 + i * 2, 9 - 3, 1, 4, "ice");
    let x = 3;
    for (let i = 0; i < 20 && x < 34; i++) {
      if (i > Math.floor(p * 14)) break;
      const h = 2 + Math.floor(rand(i + 3) * 5);
      rect(put, x, 20 - h, 1, h, "solid");
      x += 2 + Math.floor(rand(i + 11) * 4);
    }
    put(3 + Math.min(fast, 15) * 2 + 1, 8, "live");
    put(x, 19, "live");
    rect(put, 36, 4, 2, 5, "ice");
    rect(put, 36, 13, 2, 8, "solid");
  },
};

export default function PixelScene({ id, className = "" }: { id: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = scenes[id];
    if (!canvas || !scene) return;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = 0, visible = false, cell = 0;
    let palette: Record<Color, string> = { deep: "", solid: "", ice: "", snow: "", live: "" };

    const readPalette = () => {
      const s = getComputedStyle(document.documentElement);
      const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
      const light = document.documentElement.dataset.theme === "light";
      palette = {
        deep: v("--site-accent-deep", "#174f8c"),
        solid: v("--site-accent-solid", "#2677cc"),
        ice: v("--site-accent", "#8fd0f2"),
        snow: light ? "#0f3f73" : "#eef8ff",
        live: v("--site-live", "#ffb547"),
      };
    };

    const size = () => {
      const w = canvas.clientWidth;
      cell = Math.max(3, Math.floor(w / COLS));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = cell * COLS * dpr;
      canvas.height = cell * ROWS * dpr;
      canvas.style.height = `${cell * ROWS}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const put: Put = (x, y, c, a = 1) => {
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
      ctx.globalAlpha = a;
      ctx.fillStyle = palette[c];
      ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, cell * COLS, cell * ROWS);
      ctx.fillStyle = palette.ice;
      ctx.globalAlpha = 0.06;
      for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
      scene(put, now / 1000);
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      raf = visible ? requestAnimationFrame(loop) : 0;
      if (now - last < 1000 / 20) return;
      last = now;
      draw(now);
    };

    readPalette();
    size();
    draw(reduced ? 2200 : performance.now());

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !reduced;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      size();
      draw(performance.now());
    });
    ro.observe(canvas);
    const mo = new MutationObserver(() => {
      readPalette();
      draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
    };
  }, [id]);

  return <canvas ref={canvasRef} className={`block w-full [image-rendering:pixelated] ${className}`} role="img" aria-label={`Pixel illustration for ${id}`} />;
}
