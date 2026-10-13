import { Fragment } from "react";
import type { Project } from "../data/profile";

type Props = {
  diagram: Project["diagram"];
  /** Blocks to spotlight; the rest dim and their traces stop flowing. */
  active?: number[];
  className?: string;
};

/**
 * The project's real pipeline as a pixel circuit: square blocks with a hard pixel
 * shadow, joined by right-angle traces that carry square packets. Nodes are ranked
 * by their longest forward path, so fan-out lands side by side; an edge pointing
 * backwards becomes a "loops to" note on its source block.
 */
export default function ProjectDiagram({ diagram, active, className = "" }: Props) {
  const lit = (i: number) => !active || active.includes(i);
  const { nodes, edges } = diagram;
  const forward = edges.filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
  const loops = edges.filter(([a, b]) => b < a);

  const rank = nodes.map(() => 0);
  for (const [a, b] of forward) rank[b] = Math.max(rank[b], rank[a] + 1);

  const rows: number[][] = [];
  nodes.forEach((_, i) => (rows[rank[i]] ??= []).push(i));

  // ponytail: traces only join adjacent ranks; every current diagram fits that.
  const traces = (r: number) => {
    const up = rows[r - 1];
    const down = rows[r];
    const x = (row: number[], i: number) => ((row.indexOf(i) + 0.5) / row.length) * 100;
    return forward
      .filter(([a, b]) => up.includes(a) && down.includes(b))
      .map(([a, b]) => {
        const x1 = x(up, a), x2 = x(down, b);
        return { key: `${a}-${b}`, points: `${x1},0 ${x1},14 ${x2},14 ${x2},28`, on: lit(b) };
      });
  };

  return (
    <div className={`flex flex-col items-stretch ${className}`}>
      {rows.map((row, r) => (
        <Fragment key={r}>
          {r > 0 ? (
            <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="w-full h-7 overflow-visible" aria-hidden="true">
              {traces(r).map(({ key, points, on }) => (
                <g key={key} fill="none">
                  <polyline points={points} stroke="var(--site-border-strong)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
                  <polyline points={points} stroke="var(--site-accent)" strokeWidth={3} strokeDasharray="3 9" strokeLinecap="butt" vectorEffect="non-scaling-stroke" className={on ? "diagram-flow" : "opacity-20"} />
                </g>
              ))}
            </svg>
          ) : null}
          <div className="flex gap-3">
            {row.map((i) => {
              const loop = loops.find(([a]) => a === i);
              return (
                <div
                  key={i}
                  className={`flex-1 min-w-0 border-2 px-3 py-2 transition-all duration-300 ${!lit(i) ? "border-[var(--site-accent)]/15 bg-transparent opacity-45" : active ? "border-[var(--site-accent)]/70 bg-[var(--site-card-bg-strong)] shadow-[3px_3px_0_var(--site-live)]" : "border-[var(--site-accent)]/70 bg-[var(--site-card-bg-strong)] shadow-[3px_3px_0_var(--site-accent-deep)]"}`}
                >
                  <p className="font-mono text-[9px] tracking-[0.14em] text-[var(--site-accent)]">{String(i + 1).padStart(2, "0")}</p>
                  <p className="font-mono text-[11px] md:text-xs font-semibold leading-snug text-[var(--text-card)] break-words">{nodes[i]}</p>
                  {loop ? (
                    <p className="mt-0.5 font-mono text-[10px] text-[var(--site-live)]">↺ loops to {String(loop[1] + 1).padStart(2, "0")}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
