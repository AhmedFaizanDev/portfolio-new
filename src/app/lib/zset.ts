// A pocket version of what ivm does, for the in-browser demo:
//   SELECT region, COUNT(*), SUM(amount), MIN(amount) FROM sales GROUP BY region
// kept correct by applying signed deltas (insert +1, delete -1) instead of
// re-running the query. MIN is the interesting part: deleting the current
// minimum has to recover the next one, so each group keeps a multiset of amounts.

export type Row = { id: number; region: string; amount: number };
export type ViewRow = { region: string; count: number; sum: number; min: number };
export type View = Map<string, ViewRow>;

type GroupState = { count: number; sum: number; amounts: Map<number, number> };
export type State = Map<string, GroupState>;

/** Apply one weighted row. Touches exactly one group; returns its before/after. */
export function applyDelta(state: State, row: Row, weight: 1 | -1): { before: ViewRow | null; after: ViewRow | null } {
  const g = state.get(row.region) ?? { count: 0, sum: 0, amounts: new Map<number, number>() };
  const before = toViewRow(row.region, g);

  g.count += weight;
  g.sum += weight * row.amount;
  const m = (g.amounts.get(row.amount) ?? 0) + weight;
  if (m === 0) g.amounts.delete(row.amount);
  else g.amounts.set(row.amount, m);

  if (g.count === 0) state.delete(row.region);
  else state.set(row.region, g);
  return { before, after: g.count ? toViewRow(row.region, g) : null };
}

// ponytail: MIN scans the group's distinct amounts; a sorted structure if groups ever get large.
function toViewRow(region: string, g: GroupState): ViewRow | null {
  return g.count ? { region, count: g.count, sum: g.sum, min: Math.min(...g.amounts.keys()) } : null;
}

export function viewOf(state: State): View {
  const view: View = new Map();
  for (const [region, g] of state) view.set(region, toViewRow(region, g)!);
  return view;
}

/** The oracle: the same query, recomputed from scratch, sharing no code with the delta path. */
export function recompute(rows: Row[]): View {
  const view: View = new Map();
  for (const r of rows) {
    const v = view.get(r.region);
    if (!v) view.set(r.region, { region: r.region, count: 1, sum: r.amount, min: r.amount });
    else view.set(r.region, { region: r.region, count: v.count + 1, sum: v.sum + r.amount, min: Math.min(v.min, r.amount) });
  }
  return view;
}

export function sameView(a: View, b: View): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) {
    const w = b.get(k);
    if (!w || w.count !== v.count || w.sum !== v.sum || w.min !== v.min) return false;
  }
  return true;
}
