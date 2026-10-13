"use client";

import { useEffect, useRef, useState } from "react";
import type { Calendar, CalendarDay } from "../lib/github";

const STEP = 14; // 11px cell + 3px gap
const CELL = 11;
const LEFT = 30;
const TOP = 18;
const WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

const fmtDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

/** The year of commits in the site's own pixel language, drawn from GitHub's calendar. */
export default function ContributionGraph({ calendar }: { calendar: Calendar }) {
  const [hover, setHover] = useState<{ day: CalendarDay; x: number; y: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { weeks } = calendar;
  const width = LEFT + weeks.length * STEP;
  const height = TOP + 7 * STEP;

  // On narrow screens the graph scrolls; start at the most recent weeks.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const months = weeks.flatMap((week, w) => {
    const month = new Date(`${week[0].date}T00:00:00Z`).getUTCMonth();
    const prev = w > 0 ? new Date(`${weeks[w - 1][0].date}T00:00:00Z`).getUTCMonth() : -1;
    return month !== prev && w < weeks.length - 2
      ? [{ w, label: new Date(Date.UTC(2000, month, 1)).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }) }]
      : [];
  });

  return (
    <div className="relative">
      <div ref={scrollRef} className="overflow-x-auto no-scrollbar">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[640px] h-auto" role="img" aria-label={`${calendar.total} GitHub contributions in the last year across ${calendar.activeDays} active days`}>
          {months.map(({ w, label }) => (
            <text key={w} x={LEFT + w * STEP} y={11} className="fill-[var(--text-muted)] text-[10px] font-mono">{label}</text>
          ))}
          {WEEKDAYS.map((d, i) => d && (
            <text key={d} x={0} y={TOP + i * STEP + 9} className="fill-[var(--text-muted)] text-[10px] font-mono">{d}</text>
          ))}
          {weeks.map((week, w) =>
            week.map((day) => {
              const row = new Date(`${day.date}T00:00:00Z`).getUTCDay();
              const x = LEFT + w * STEP;
              const y = TOP + row * STEP;
              return (
                <rect
                  key={day.date}
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={`var(--heat-${day.level})`}
                  stroke={hover?.day.date === day.date ? "var(--site-live)" : "none"}
                  strokeWidth={1.5}
                  onMouseEnter={() => setHover({ day, x: (x + CELL / 2) / width, y: y / height })}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })
          )}
        </svg>
      </div>

      {hover ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-[var(--site-border-strong)] bg-[var(--site-surface-strong)] backdrop-blur-xl px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] shadow-lg"
          style={{ left: `${hover.x * 100}%`, top: `calc(${hover.y * 100}% - 6px)` }}
        >
          {hover.day.count} contribution{hover.day.count === 1 ? "" : "s"} <span className="text-[var(--text-muted)] font-medium">· {fmtDay(hover.day.date)}</span>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] font-mono text-[var(--text-muted)]">
        Less
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className="h-[11px] w-[11px] rounded-[2px]" style={{ background: `var(--heat-${l})` }} />
        ))}
        More
      </div>
    </div>
  );
}
