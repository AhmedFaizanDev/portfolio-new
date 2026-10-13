"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Ago from "./Ago";
import type { Build, Push } from "../lib/github";
import { profile } from "../data/profile";

export type Status = {
  pushes: Push[];
  ci: { repo: string; passing: boolean; at: string; url: string } | null;
  activity: { last7: number; last30: number; weekly: number[] } | null;
  build: Build;
};

// Hyderabad wall clock, ticking every 15s; null during SSR so nothing mismatches.
const subscribeClock = (tick: () => void) => {
  const id = window.setInterval(tick, 15000);
  return () => window.clearInterval(id);
};
const hyderabadTime = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
export function useHyderabadTime(): string | null {
  return useSyncExternalStore(subscribeClock, hyderabadTime, () => null);
}

type Item = { key: string; icon: string; content: ReactNode; href?: string };

/**
 * The top pill: a live status line for the person behind the site.
 * Every item is read from GitHub or the deploy itself; nothing is decorative.
 */
export default function ShipLog({ status }: { status: Status }) {
  const reduceMotion = useReducedMotion();
  const time = useHyderabadTime();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const items: Item[] = [];
  const latest = status.pushes[0];
  if (latest) {
    items.push({ key: "push", icon: "commit", href: latest.url, content: <>pushed <b className="font-semibold">{latest.name}</b> · <Ago iso={latest.pushedAt} /></> });
  }
  if (status.ci) {
    items.push({
      key: "ci", icon: status.ci.passing ? "verified" : "error", href: status.ci.url,
      content: <>{status.ci.repo} CI {status.ci.passing ? "passing" : "failing"} · <Ago iso={status.ci.at} /></>,
    });
  }
  if (status.activity) {
    // Say the most recent window that has something in it; skip the item if neither does.
    const { last7, last30 } = status.activity;
    const [n, span] = last7 ? [last7, "this week"] : [last30, "in the last 30 days"];
    if (n) items.push({ key: "week", icon: "monitoring", href: `https://github.com/${profile.githubUsername}`, content: <>{n} contribution{n === 1 ? "" : "s"} {span}</> });
  }
  items.push({
    key: "build", icon: "deployed_code",
    content: status.build.sha ? <>site deployed {status.build.sha} · <Ago iso={status.build.builtAt} /></> : <>site built <Ago iso={status.build.builtAt} /></>,
  });
  if (time) items.push({ key: "clock", icon: "schedule", content: <>{time} in Hyderabad</> });

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => setIndex((i) => i + 1), 5000);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion]);

  const item = items[index % items.length];
  const bars = status.activity?.weekly;
  const peak = bars ? Math.max(1, ...bars) : 1;
  const body = (
    <motion.span
      key={item.key}
      initial={reduceMotion ? false : { y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={reduceMotion ? undefined : { y: -10, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-center gap-2 min-w-0"
    >
      <span className="material-symbols-outlined text-[15px] text-[var(--site-live)] flex-shrink-0" aria-hidden="true">{item.icon}</span>
      <span className="truncate text-sm font-medium text-[var(--site-foreground)]">{item.content}</span>
    </motion.span>
  );

  return (
    <div
      className="flex items-center gap-2 w-full min-w-0 h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--site-live)] opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--site-live)]" />
      </span>

      <div className="flex-1 min-w-0 overflow-hidden" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {item.href ? (
            <a key={item.key} href={item.href} target="_blank" rel="noreferrer" className="block min-w-0 hover:opacity-80">{body}</a>
          ) : (
            <div key={item.key} className="min-w-0">{body}</div>
          )}
        </AnimatePresence>
      </div>

      {bars ? (
        <div className="flex items-end gap-[2px] h-4 flex-shrink-0" role="img" aria-label={`Contributions per week, last 12 weeks: ${bars.join(", ")}`} title="Contributions per week, last 12 weeks">
          {bars.map((n, i) => (
            <span key={i} className="w-[2px] rounded-full bg-[var(--site-live)]" style={{ height: `${Math.max(2, (n / peak) * 16)}px`, opacity: n ? 0.95 : 0.3 }} />
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIndex((i) => i + 1)}
        className="w-6 h-6 rounded-full bg-[var(--site-accent-solid)] text-white flex items-center justify-center hover:bg-[var(--site-accent-hover)] transition-colors flex-shrink-0 ml-1"
        aria-label="Next status"
      >
        <span className="material-symbols-outlined text-[14px] leading-none">skip_next</span>
      </button>
    </div>
  );
}
