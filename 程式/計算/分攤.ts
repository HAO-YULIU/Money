import type { Expense } from './資料型別';

/**
 * How much each member owes for one expense. Sums to `e.amount`.
 * Equal split: every participant except the payer pays ceil(amount / n);
 * the payer's share is whatever is left (may be negative = rounding bonus).
 */
export function computeShares(e: Expense): Record<string, number> {
  if (e.split.mode === 'custom') {
    const out: Record<string, number> = {};
    for (const [id, v] of Object.entries(e.split.amounts)) if (v !== 0) out[id] = v;
    return out;
  }
  const ids = e.split.participantIds;
  const per = Math.ceil(e.amount / ids.length);
  const out: Record<string, number> = {};
  let others = 0;
  for (const id of ids) {
    if (id === e.payerId) continue;
    out[id] = per;
    others += per;
  }
  const payerShare = e.amount - others;
  if (ids.includes(e.payerId) || payerShare !== 0) out[e.payerId] = payerShare;
  return out;
}

export type DetailLine = { memberId: string; value: number; roundingBonus: boolean };

/** Per-member effect of one expense for display: −share; a negative share shows as a + rounding bonus. */
export function detailLines(e: Expense): DetailLine[] {
  return Object.entries(computeShares(e)).map(([memberId, share]) => ({
    memberId,
    value: share === 0 ? 0 : -share,
    roundingBonus: share < 0,
  }));
}
