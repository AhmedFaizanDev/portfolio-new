"use client";

import { useSyncExternalStore } from "react";

export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(1, Math.round((now - new Date(iso).getTime()) / 1000));
  const steps: [number, string][] = [[31536000, "y"], [2592000, "mo"], [604800, "w"], [86400, "d"], [3600, "h"], [60, "m"]];
  for (const [secs, unit] of steps) if (s >= secs) return `${Math.floor(s / secs)}${unit} ago`;
  return "just now";
}

const noop = () => () => {};

/**
 * Relative time that can't cause a hydration mismatch: the static HTML carries
 * the calendar date, the browser swaps in "3d ago" once it knows the time.
 */
export default function Ago({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    noop,
    () => timeAgo(iso),
    () => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
  );
  return (
    <time dateTime={iso} title={new Date(iso).toUTCString()}>
      {text}
    </time>
  );
}
