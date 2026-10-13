// Self-check for the demo engine, in the same spirit as ivm's oracle tests:
// random insert/delete streams, drained to empty, compared to a recompute after every step.
// Run: node src/app/lib/zset.check.ts
import assert from "node:assert/strict";
import { applyDelta, recompute, sameView, viewOf, type Row, type State } from "./zset.ts";

const regions = ["north", "south", "east", "west"];
let seed = 7;
const rand = (n: number) => ((seed = (seed * 1103515245 + 12345) % 2 ** 31), seed % n);

for (let run = 0; run < 200; run++) {
  const state: State = new Map();
  const rows: Row[] = [];
  let id = 0;
  for (let step = 0; step < 60; step++) {
    if (rows.length && rand(3) === 0) {
      // bias toward deleting a group's current minimum: the retraction naive versions get wrong
      const byMin = [...rows].sort((a, b) => a.amount - b.amount);
      const row = rand(2) ? byMin[0] : rows[rand(rows.length)];
      rows.splice(rows.indexOf(row), 1);
      applyDelta(state, row, -1);
    } else {
      const row = { id: id++, region: regions[rand(4)], amount: 10 + rand(40) };
      rows.push(row);
      applyDelta(state, row, 1);
    }
    assert.ok(sameView(viewOf(state), recompute(rows)), `diverged at run ${run}, step ${step}`);
  }
  while (rows.length) {
    applyDelta(state, rows.pop()!, -1);
    assert.ok(sameView(viewOf(state), recompute(rows)), `diverged while draining run ${run}`);
  }
  assert.equal(state.size, 0);
}
console.log("zset: 200 random streams, incremental == recompute after every delta");
