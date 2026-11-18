import { suggestTransfers } from './結算';
import { computeBalances } from './餘額';
import { randomGroup } from './測試工具';

test('everyone pays the single creditor', () => {
  const t = suggestTransfers({ A: 102, B: -34, C: -34, D: -34 });
  expect(t).toHaveLength(3);
  for (const x of t) expect(x).toMatchObject({ toId: 'A', amount: 34 });
});

test('no transfers when settled', () => {
  expect(suggestTransfers({ A: 0, B: 0 })).toEqual([]);
});

test('chains are collapsed: A owes B, B owes C → A pays C', () => {
  expect(suggestTransfers({ A: -50, B: 0, C: 50 })).toEqual([{ fromId: 'A', toId: 'C', amount: 50 }]);
});

test('property: applying transfers settles everyone', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const b = computeBalances(randomGroup(seed));
    const transfers = suggestTransfers(b);
    const after = { ...b };
    for (const t of transfers) {
      expect(t.amount).toBeGreaterThan(0);
      after[t.fromId] += t.amount;
      after[t.toId] -= t.amount;
    }
    for (const v of Object.values(after)) expect(v).toBe(0);
    const nonZero = Object.values(b).filter((v) => v !== 0).length;
    expect(transfers.length).toBeLessThanOrEqual(Math.max(0, nonZero - 1));
  }
});
