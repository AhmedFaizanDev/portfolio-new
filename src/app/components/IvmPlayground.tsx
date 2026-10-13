"use client";

import { useRef, useState } from "react";
import { say } from "./NotificationBubble";
import { applyDelta, recompute, sameView, viewOf, type Row, type State, type ViewRow } from "../lib/zset";

const REGIONS = ["north", "south", "east", "west"];
const SEED: Row[] = [
  { id: 1, region: "north", amount: 42 },
  { id: 2, region: "south", amount: 25 },
  { id: 3, region: "east", amount: 12 },
  { id: 4, region: "north", amount: 18 },
  { id: 5, region: "south", amount: 40 },
  { id: 6, region: "east", amount: 33 },
];

type LogEntry = { step: number; weight: 1 | -1; row: Row; before: ViewRow | null; after: ViewRow | null };

const seeded = (): State => {
  const s: State = new Map();
  for (const r of SEED) applyDelta(s, r, 1);
  return s;
};

function describe({ before, after }: LogEntry): string {
  const region = (after ?? before)!.region;
  if (!before) return `${region}: new group (count 1, min ${after!.min})`;
  if (!after) return `${region}: group emptied, retracted`;
  const parts = [`count ${before.count}→${after.count}`, `sum ${before.sum}→${after.sum}`];
  if (before.min !== after.min) parts.push(`min ${before.min}→${after.min}`);
  return `${region}: ${parts.join(" · ")}`;
}

/**
 * The ivm idea, runnable: edit the base table and the view is patched by the
 * row's signed weight alone. After every change it is checked against a full
 * recompute, the same oracle discipline as the real repo's 570 tests.
 */
export default function IvmPlayground() {
  // The engine is mutable, so it lives in a ref touched only by event handlers;
  // what renders is the view snapshot in state.
  const engine = useRef<State | null>(null);
  const nextId = useRef(SEED.length + 1);
  const [rows, setRows] = useState<Row[]>(SEED);
  const [view, setView] = useState(() => viewOf(seeded()));
  const [log, setLog] = useState<LogEntry[]>([]);
  const [checks, setChecks] = useState({ passed: 0, total: 0 });
  const last = log[0];

  const apply = (row: Row, weight: 1 | -1) => {
    engine.current ??= seeded();
    const { before, after } = applyDelta(engine.current, row, weight);
    const nextRows = weight === 1 ? [...rows, row] : rows.filter((r) => r.id !== row.id);
    const nextView = viewOf(engine.current);
    const ok = sameView(nextView, recompute(nextRows));
    setRows(nextRows);
    setView(nextView);
    setLog((l) => [{ step: checks.total + 1, weight, row, before, after }, ...l].slice(0, 5));
    setChecks((c) => ({ passed: c.passed + (ok ? 1 : 0), total: c.total + 1 }));
    if (checks.total + 1 === 5 && ok && checks.passed === 4) say("5/5 oracle checks passed. You'd make a good reviewer.");
  };

  const insert = () => {
    const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
    apply({ id: nextId.current++, region, amount: 10 + Math.floor(Math.random() * 60) }, 1);
  };

  // Deleting a group's current MIN is the case naive incremental engines get wrong.
  const deleteMin = () => {
    const groups = [...view.values()];
    if (!groups.length) return;
    const g = groups[Math.floor(Math.random() * groups.length)];
    apply(rows.find((r) => r.region === g.region && r.amount === g.min)!, -1);
  };

  const reset = () => {
    engine.current = seeded();
    nextId.current = SEED.length + 1;
    setRows(SEED);
    setView(viewOf(engine.current));
    setLog([]);
    setChecks({ passed: 0, total: 0 });
  };

  const changedRegion = last ? (last.after ?? last.before)!.region : null;
  const allPassed = checks.passed === checks.total;
  const th = "px-3 py-2 text-left text-[10px] tracking-[0.14em] uppercase font-bold text-[var(--text-muted)]";
  const td = "px-3 py-1.5 font-mono text-[13px] tabular-nums";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[12px] text-[var(--text-secondary)] break-all">
          <span className="text-[var(--site-accent)]">SELECT</span> region, COUNT(*), SUM(amount), MIN(amount) <span className="text-[var(--site-accent)]">FROM</span> sales <span className="text-[var(--site-accent)]">GROUP BY</span> region
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={insert} className="rounded-full bg-[var(--site-accent-solid)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--site-accent-hover)] transition-colors">
            + Insert row
          </button>
          <button type="button" onClick={deleteMin} disabled={!rows.length} className="rounded-full border border-[var(--site-border-strong)] bg-[var(--site-card-bg-strong)] px-4 py-2 text-xs font-bold text-[var(--text-card)] hover:border-[var(--site-accent)]/60 transition-colors disabled:opacity-50">
            − Delete a group&apos;s MIN
          </button>
          <button type="button" onClick={reset} className="rounded-full px-3 py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--site-accent)] transition-colors">
            Reset
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] overflow-hidden">
          <table className="w-full">
            <caption className="px-3 pt-3 text-left text-[11px] font-bold text-[var(--text-secondary)]">sales · base table · {rows.length} rows</caption>
            <thead><tr><th className={th}>id</th><th className={th}>region</th><th className={th}>amount</th><th className={th}><span className="sr-only">delete</span></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-t border-[var(--site-border)] ${last?.weight === 1 && last.row.id === r.id ? "bg-[var(--site-live)]/10" : ""}`}>
                  <td className={`${td} text-[var(--text-muted)]`}>{r.id}</td>
                  <td className={`${td} text-[var(--text-card)]`}>{r.region}</td>
                  <td className={`${td} text-[var(--text-card)]`}>{r.amount}</td>
                  <td className="px-2 text-right">
                    <button type="button" onClick={() => apply(r, -1)} aria-label={`Delete row ${r.id}`} className="h-6 w-6 rounded-md text-[var(--text-muted)] hover:bg-[var(--site-accent)]/10 hover:text-[var(--site-accent)] transition-colors">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] overflow-hidden self-start">
          <table className="w-full">
            <caption className="px-3 pt-3 text-left text-[11px] font-bold text-[var(--text-secondary)]">view · maintained from deltas</caption>
            <thead><tr><th className={th}>region</th><th className={th}>count</th><th className={th}>sum</th><th className={th}>min</th></tr></thead>
            <tbody>
              {[...view.values()].sort((a, b) => a.region.localeCompare(b.region)).map((v) => (
                <tr key={v.region} className={`border-t border-[var(--site-border)] transition-colors duration-700 ${v.region === changedRegion ? "bg-[var(--site-live)]/12" : ""}`}>
                  <td className={`${td} text-[var(--text-card)]`}>{v.region}</td>
                  <td className={`${td} text-[var(--text-card)]`}>{v.count}</td>
                  <td className={`${td} text-[var(--text-card)]`}>{v.sum}</td>
                  <td className={`${td} ${last && v.region === changedRegion && last.before && last.before.min !== v.min ? "text-[var(--site-live)] font-bold" : "text-[var(--text-card)]"}`}>{v.min}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!view.size ? <p className="px-3 py-4 text-sm text-[var(--text-muted)]">Every row retracted. The view is empty, as it should be.</p> : null}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-4 py-3 font-mono text-[12px] leading-relaxed">
        {log.length ? (
          log.map((e, i) => (
            <p key={e.step} className={i ? "text-[var(--text-muted)]" : "text-[var(--text-card)]"}>
              <span className={e.weight === 1 ? "text-[var(--site-accent)]" : "text-[var(--site-live)]"}>{e.weight === 1 ? "+1" : "−1"}</span>{" "}
              ({e.row.id}, {e.row.region}, {e.row.amount}) → {describe(e)}
            </p>
          ))
        ) : (
          <p className="text-[var(--text-muted)]">Insert or delete a row. Each change is one signed delta, applied to one group.</p>
        )}
        {checks.total ? (
          <p className={`mt-2 pt-2 border-t border-[var(--site-border)] font-semibold ${allPassed ? "text-[var(--site-accent)]" : "text-red-400"}`} role="status">
            {allPassed ? "✓" : "✗"} incremental == recompute after every change · {checks.passed}/{checks.total} checks passed · last change touched 1 group, a recompute would scan {rows.length} rows
          </p>
        ) : null}
      </div>
    </div>
  );
}
