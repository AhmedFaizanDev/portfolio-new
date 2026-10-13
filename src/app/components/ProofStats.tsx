"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { achievements, experience } from "../data/profile";

/**
 * The hero's four numbers. Hover, focus or tap one and it shows the evidence
 * behind it instead of asking you to take it on trust.
 */

type Stat = { value: number; suffix: string; label: string; proof: "timeline" | "race" | "ci" | "podium" };

const STATS: Stat[] = [
  { value: 2, suffix: "+ yrs", label: "Shipping to production", proof: "timeline" },
  { value: 3600, suffix: "×", label: "ivm vs full recompute", proof: "race" },
  { value: 570, suffix: "", label: "Oracle tests, one engine", proof: "ci" },
  { value: 2, suffix: "", label: "Hackathon podiums", proof: "podium" },
];

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 900, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="tabular-nums">{n.toLocaleString("en-US")}{suffix}</span>;
}

// Months from Jun 2024 to Aug 2026, one pixel each, on three lanes.
function Timeline() {
  const start = new Date(Date.UTC(2024, 5, 1));
  const months = 27;
  const idx = (ym: string) => {
    const [y, m] = ym.split("-").map(Number);
    return (y - start.getUTCFullYear()) * 12 + (m - 1 - start.getUTCMonth());
  };
  const lanes = (["work", "freelance", "lead"] as const).map((lane) => {
    const on = new Set<number>();
    for (const e of experience.filter((x) => x.lane === lane)) for (let i = idx(e.span[0]); i <= idx(e.span[1]); i++) on.add(i);
    return { lane, on };
  });
  return (
    <div>
      {lanes.map(({ lane, on }, r) => (
        <div key={lane} className="flex items-center gap-2">
          <span className="w-14 font-mono text-[9px] text-[var(--text-muted)]">{lane}</span>
          <div className="flex gap-[2px]">
            {Array.from({ length: months }, (_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (i + r * 4) * 0.012 }}
                className="h-2 w-2 rounded-[1px]"
                style={{ background: on.has(i) ? (lane === "work" ? "var(--site-accent)" : lane === "lead" ? "var(--site-accent-solid)" : "var(--site-live)") : "rgb(var(--site-accent-rgb)/0.1)" }}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="mt-1 ml-16 flex font-mono text-[9px] text-[var(--text-muted)]">
        <span style={{ width: 7 * 10 }}>2024</span><span style={{ width: 12 * 10 }}>2025</span><span>2026</span>
      </div>
      <p className="mt-2 text-[11px] text-[var(--text-secondary)]">YuVi Collab, then AI Linc; a freelance build and a year leading Qubit Club alongside.</p>
    </div>
  );
}

function Race() {
  return (
    <div className="space-y-2.5">
      {[
        { name: "full recompute", width: "100%", duration: 1.4, note: "rescans 50,000 rows" },
        { name: "ivm", width: "3px", duration: 0.05, note: "one delta · p50 21 µs" },
      ].map((r) => (
        <div key={r.name}>
          <div className="flex justify-between font-mono text-[10px] text-[var(--text-muted)]">
            <span>{r.name}</span>
            <span>{r.note}</span>
          </div>
          <div className="mt-1 h-2.5 rounded-[2px] bg-[rgb(var(--site-accent-rgb)/0.1)] overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: r.width }} transition={{ duration: r.duration, ease: "linear" }} className={`h-full ${r.name === "ivm" ? "bg-[var(--site-live)]" : "bg-[var(--site-accent-solid)]"}`} />
          </div>
        </div>
      ))}
      <p className="text-[11px] text-[var(--text-secondary)]">Same GROUP BY update on a 50K-row base: ≈3,600× less work per change.</p>
    </div>
  );
}

function CiRun() {
  return (
    <div>
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(38, 5px)" }}>
        {Array.from({ length: 570 }, (_, i) => (
          <motion.span key={i} initial={{ opacity: 0.12 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.0016, duration: 0.1 }} className="h-[5px] w-[5px] bg-[var(--site-accent)]" />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-[var(--text-secondary)]">570/570 pass: incremental == recompute after every delta, CI on Python 3.10–3.12.</p>
    </div>
  );
}

function Podium() {
  const wins = achievements.filter((a) => /winner|place/i.test(a.title)).slice(0, 2);
  return (
    <div className="flex items-end gap-4">
      {wins.map((a, i) => (
        <div key={a.title} className="flex items-end gap-2">
          <motion.div initial={{ height: 0 }} animate={{ height: i === 0 ? 46 : 28 }} transition={{ duration: 0.5, delay: i * 0.15 }} className={`w-6 ${i === 0 ? "bg-[var(--site-live)]" : "bg-[var(--site-accent-solid)]"}`} />
          <div className="pb-0.5">
            <p className="font-doto text-sm font-black text-[var(--text-heading)]">{i === 0 ? "1st" : "3rd"}</p>
            <p className="text-[10px] leading-tight text-[var(--text-secondary)]">{a.title.split("·")[1]?.trim()}<br />{a.where}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const PROOF = { timeline: Timeline, race: Race, ci: CiRun, podium: Podium };

export default function ProofStats({ mobile = false }: { mobile?: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  const Proof = active === null ? null : PROOF[STATS[active].proof];

  const panel = (
    <AnimatePresence>
      {Proof ? (
        <motion.div
          key={active}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden"
        >
          <div className={`rounded-xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] p-3 text-left ${mobile ? "mt-3" : "mb-3"}`}>
            <Proof />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div onMouseLeave={() => !mobile && setActive(null)} onKeyDown={(e) => e.key === "Escape" && setActive(null)}>
      {!mobile && panel}
      <div className={`grid grid-cols-2 ${mobile ? "gap-3" : "gap-4"}`}>
        {STATS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            aria-expanded={active === i}
            onMouseEnter={() => !mobile && setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => mobile && setActive(active === i ? null : i)}
            className={`text-left rounded-xl p-3 border transition-colors ${active === i ? "border-[var(--site-accent)]/50 bg-[var(--site-card-bg-strong)]" : "border-[var(--site-border)]/50 bg-[var(--site-card-bg-strong)]/50 hover:border-[var(--site-accent)]/30"}`}
          >
            <p className={`font-doto font-black text-[var(--site-accent)] leading-none ${mobile ? "text-xl" : "text-2xl"}`}>
              <CountUp value={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-[9px] md:text-[10px] tracking-[0.12em] uppercase font-bold text-[var(--text-secondary)]">{s.label}</p>
          </button>
        ))}
      </div>
      {mobile && panel}
      <p className="mt-2 text-center font-mono text-[9px] text-[var(--text-muted)]">{mobile ? "tap" : "hover"} a number for the proof</p>
    </div>
  );
}
