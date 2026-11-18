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

export type ExpenseLine =
  | { memberId: string; kind: 'pay'; amount: number }
  | { memberId: string; kind: 'self'; amount: number }
  | { memberId: string; kind: 'receive'; amount: number; note?: { type: 'own' | 'bonus'; amount: number } };

/**
 * What each person pays or receives because of one expense.
 * Payer first: receives (amount − own share); the note says how much they bore themselves,
 * or how much rounding bonus is included. Others: pay their share.
 */
export function expenseLines(e: Expense): ExpenseLine[] {
  const shares = computeShares(e);
  const own = shares[e.payerId] ?? 0;
  const receive = e.amount - own;
  const payer: ExpenseLine =
    receive === 0
      ? { memberId: e.payerId, kind: 'self', amount: e.amount }
      : own > 0
        ? { memberId: e.payerId, kind: 'receive', amount: receive, note: { type: 'own', amount: own } }
        : own < 0
          ? { memberId: e.payerId, kind: 'receive', amount: receive, note: { type: 'bonus', amount: -own } }
          : { memberId: e.payerId, kind: 'receive', amount: receive };
  const others: ExpenseLine[] = Object.entries(shares)
    .filter(([id, v]) => id !== e.payerId && v !== 0)
    .map(([memberId, amount]) => ({ memberId, kind: 'pay', amount }));
  return [payer, ...others];
}
