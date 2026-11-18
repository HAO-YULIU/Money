import { computeShares } from './split';
import type { Group } from './types';

/** balance = total paid − total share. Positive: should receive; negative: should pay. */
export function computeBalances(g: Group): Record<string, number> {
  const b: Record<string, number> = {};
  for (const m of g.members) b[m.id] = 0;
  for (const e of g.expenses) {
    b[e.payerId] = (b[e.payerId] ?? 0) + e.amount;
    for (const [id, share] of Object.entries(computeShares(e))) b[id] = (b[id] ?? 0) - share;
  }
  return b;
}
