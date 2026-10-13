"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useTransform } from "framer-motion";
import SceneAtmosphere, { usePointerDepth } from "./SceneAtmosphere";
import bgNoBgImage from "../assets/glacier/mountain.png";

type HomeBackgroundProps = {
  quality?: "default" | "lite";
  /** Home only: the mountain shifts with the cursor, plus snow, stars and time-of-day light. */
  scene?: boolean;
};

export default function HomeBackground({ quality = "default", scene = false }: HomeBackgroundProps) {
  const depth = usePointerDepth();
  const mountainX = useTransform(depth.x, (v) => (scene ? v * -14 : 0));
  const mountainY = useTransform(depth.y, (v) => (scene ? v * -8 : 0));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: -1000, y: -1000 });
  const lastActiveRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const rootStyles = () => getComputedStyle(document.documentElement);

    let animationFrameId = 0;
    let width = 0;
    let height = 0;

    const pixelSize = quality === "lite" ? 22 : (window.innerWidth < 768 ? 12 : 19);
    const targetFps = quality === "lite" ? 24 : 35;
    const targetFrameMs = 1000 / targetFps;

    // Track state to avoid global window re-evaluation
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      if (width !== newWidth || height !== newHeight) {
        width = newWidth;
        height = newHeight;

        // Scale with devicePixelRatio for sharpness
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      lastActiveRef.current = performance.now();
    };

    const handleMouseLeave = () => {
      pointerRef.current.x = -1000;
      pointerRef.current.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    // Pre-initialize cell static parameters to avoid allocations inside loop
    let cols = Math.ceil(width / pixelSize) + 1;
    let rows = Math.ceil(height / pixelSize) + 1;
    let totalCells = cols * rows;

    // Simple pseudo-random helper
    const seededNoise = (n: number) => {
      const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    // Build grid characteristics
    let cellParams = Array.from({ length: totalCells }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const xRatio = cols > 1 ? col / (cols - 1) : 0.5;
      const yRatio = rows > 1 ? row / (rows - 1) : 0.5;

      const sideDensity = Math.pow(Math.abs(xRatio - 0.5) * 2, 1.45);
      const centerLift = Math.exp(-Math.pow((xRatio - 0.5) / 0.18, 2));
      const verticalDepth = yRatio * 0.08;
      const r = seededNoise(i * 3 + 7) * 0.2 - 0.1;

      const lowOpacity = Math.max(0.02, Math.min(0.12, 0.06 + sideDensity * 0.03 - centerLift * 0.02 + verticalDepth * 0.05 + r));
      const highOpacity = Math.min(0.24, lowOpacity + (0.04 + seededNoise(i * 11 + 29) * 0.06));
      const speed = 0.0004 + seededNoise(i * 17 + 3) * 0.0006;
      const phase = seededNoise(i * 23 + 19) * Math.PI * 2;

      return {
        col,
        row,
        cx: col * pixelSize + pixelSize / 2,
        cy: row * pixelSize + pixelSize / 2,
        lowOpacity,
        highOpacity,
        speed,
        phase
      };
    });

    // Re-verify params on size changes
    let lastCheckedWidth = width;
    let lastCheckedHeight = height;

    const verifyParams = () => {
      if (width !== lastCheckedWidth || height !== lastCheckedHeight) {
        cols = Math.ceil(width / pixelSize) + 1;
        rows = Math.ceil(height / pixelSize) + 1;
        totalCells = cols * rows;
        cellParams = Array.from({ length: totalCells }, (_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const xRatio = cols > 1 ? col / (cols - 1) : 0.5;
          const yRatio = rows > 1 ? row / (rows - 1) : 0.5;

          const sideDensity = Math.pow(Math.abs(xRatio - 0.5) * 2, 1.45);
          const centerLift = Math.exp(-Math.pow((xRatio - 0.5) / 0.18, 2));
          const verticalDepth = yRatio * 0.08;
          const r = seededNoise(i * 3 + 7) * 0.2 - 0.1;

          const lowOpacity = Math.max(0.02, Math.min(0.12, 0.06 + sideDensity * 0.03 - centerLift * 0.02 + verticalDepth * 0.05 + r));
          const highOpacity = Math.min(0.24, lowOpacity + (0.04 + seededNoise(i * 11 + 29) * 0.06));
          const speed = 0.0004 + seededNoise(i * 17 + 3) * 0.0006;
          const phase = seededNoise(i * 23 + 19) * Math.PI * 2;

          return {
            col,
            row,
            cx: col * pixelSize + pixelSize / 2,
            cy: row * pixelSize + pixelSize / 2,
            lowOpacity,
            highOpacity,
            speed,
            phase
          };
        });
        lastCheckedWidth = width;
        lastCheckedHeight = height;
      }
    };

    let prevTime = performance.now();
    let lastPaintTime = 0;

    // Drifting ball for ambient motion
    const ballPos = { x: width * 0.5, y: height * 0.48 };
    const ballTarget = { x: width * 0.5, y: height * 0.48 };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);

      if (document.visibilityState === "hidden") {
        return;
      }

      const elapsed = now - lastPaintTime;
      if (elapsed < targetFrameMs) {
        return;
      }

      lastPaintTime = now - (elapsed % targetFrameMs);
      const dt = Math.min(33, now - prevTime);
      prevTime = now;

      verifyParams();

      const styles = rootStyles();
      const canvasFill = styles.getPropertyValue("--site-canvas-fill").trim() || "#061329";
      const pixelFill = styles.getPropertyValue("--site-accent").trim() || "#8fd0f2";
      const gridFill = styles.getPropertyValue("--site-canvas-grid").trim() || "rgba(2, 8, 20, 0.34)";

      // Theme-aware canvas background
      ctx.fillStyle = canvasFill;
      ctx.fillRect(0, 0, width, height);

      // Determine glow source: cursor or drifting wave
      const isPointerActive = pointerRef.current.x !== -1000 && (now - lastActiveRef.current < 4000);
      const ballRadius = quality === "lite" ? pixelSize * 8 : pixelSize * 10;

      if (isPointerActive && !prefersReducedMotion) {
        ballPos.x += (pointerRef.current.x - ballPos.x) * Math.min(1, dt * 0.024);
        ballPos.y += (pointerRef.current.y - ballPos.y) * Math.min(1, dt * 0.024);
      } else if (!prefersReducedMotion) {
        // Drift in waves
        const xWave = Math.sin(now * 0.0003);
        const yWave = Math.sin(now * 0.00045 + 1.2);
        ballTarget.x = width * 0.5 + xWave * (width * 0.28);
        ballTarget.y = height * 0.48 + yWave * (height * 0.22);

        ballPos.x += (ballTarget.x - ballPos.x) * Math.min(1, dt * 0.014);
        ballPos.y += (ballTarget.y - ballPos.y) * Math.min(1, dt * 0.014);
      }

      // Draw grid
      const len = cellParams.length;
      for (let i = 0; i < len; i++) {
        const cell = cellParams[i];


        // Flicker effect
        let opacity = cell.lowOpacity;
        if (!prefersReducedMotion) {
          const sine = Math.sin(now * cell.speed + cell.phase);
          opacity = cell.lowOpacity + ((sine + 1) / 2) * (cell.highOpacity - cell.lowOpacity);
        }

        // Glow influence
        if (!prefersReducedMotion) {
          const dx = cell.cx - ballPos.x;
          const dy = cell.cy - ballPos.y;
          const dist = Math.hypot(dx, dy);
          if (dist < ballRadius) {
            const ratio = 1 - dist / ballRadius;
            opacity = Math.min(0.78, opacity + ratio * 0.46);
          }
        }

        // Theme-aware teal pixel cells with transition
        ctx.fillStyle = pixelFill;
        ctx.globalAlpha = opacity;

        if (ctx.globalAlpha > 0) {
          ctx.fillRect(cell.col * pixelSize + 1, cell.row * pixelSize + 1, pixelSize - 1, pixelSize - 1);
        }
        ctx.globalAlpha = 1;

        // Draw grid lines using the current theme separator color
        ctx.fillStyle = gridFill;
        ctx.fillRect(cell.col * pixelSize, cell.row * pixelSize, pixelSize, 1);
        ctx.fillRect(cell.col * pixelSize, cell.row * pixelSize, 1, pixelSize);
      }
    };

    render(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [quality]);

  return (
    <div className="home-pixel-field absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Background image */}
      <motion.div className="absolute inset-0 z-0" style={{ x: mountainX, y: mountainY }}>
        {/* Mobile: bg-nobg.png */}
        <Image
          src={bgNoBgImage}
          alt="Background"
          fill
          className="md:hidden object-contain object-[right_90%] scale-125"
          priority
          sizes="100vw"
        />
        {/* Desktop: bg-nobg.png with reduced size and pushed down */}
        <div className="hidden md:block absolute inset-0 translate-x-[20%] translate-y-[20%]">
          <Image
            src={bgNoBgImage}
            alt="Background"
            fill
            className="object-contain object-[right_20%_bottom_30%] scale-65"
            priority
            sizes="100vw"
          />
        </div>
      </motion.div>
      {/* Glass overlay for premium effect */}
      <div className="absolute inset-0 z-5 bg-white/5" />
      {/* Canvas overlay for pixel animation */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 block w-full h-full opacity-60 border-none outline-none pointer-events-none" />
      {scene ? <SceneAtmosphere depth={depth} /> : null}
    </div>
  );
}
