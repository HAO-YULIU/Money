import type { Expense, Group } from './資料型別';

export const eq = (amount: number, payerId: string, ids: string[]): Expense => ({
  id: 'e', title: 't', amount, payerId, date: '2026-11-18', kind: 'expense',
  split: { mode: 'equal', participantIds: ids },
});

export const group = (memberIds: string[], expenses: Expense[]): Group => ({
  id: 'g', name: 'G', createdAt: '', updatedAt: '',
  members: memberIds.map((id) => ({ id, name: id })),
  expenses,
});

/** Deterministic PRNG for property tests. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return (n: number) => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s % n;
  };
}

export function randomGroup(seed: number): Group {
  const r = rng(seed);
  const ids = Array.from({ length: 2 + r(5) }, (_, i) => `m${i}`);
  const expenses: Expense[] = Array.from({ length: 1 + r(20) }, (_, i) => {
    const amount = 1 + r(10000);
    const payerId = ids[r(ids.length)];
    if (r(3) === 0) {
      // custom split: distribute amount randomly
      const amounts: Record<string, number> = {};
      let left = amount;
      ids.forEach((id, k) => {
        const v = k === ids.length - 1 ? left : r(left + 1);
        if (v > 0) amounts[id] = v;
        left -= v;
      });
      return { id: `e${i}`, title: 't', amount, payerId, date: '2026-11-18', kind: 'expense', split: { mode: 'custom', amounts } };
    }
    const participantIds = ids.filter(() => r(2) === 0);
    if (participantIds.length === 0) participantIds.push(ids[0]);
    return { id: `e${i}`, title: 't', amount, payerId, date: '2026-11-18', kind: 'expense', split: { mode: 'equal', participantIds } };
  });
  return group(ids, expenses);
}
