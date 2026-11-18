import { computeShares, detailLines } from './split';
import { eq, randomGroup } from './testUtils';

test('equal split: non-payers round up, payer takes the rest', () => {
  expect(computeShares(eq(100, 'A', ['A', 'B', 'C']))).toEqual({ A: 32, B: 34, C: 34 });
  expect(computeShares(eq(99, 'A', ['A', 'B', 'C']))).toEqual({ A: 33, B: 33, C: 33 });
  expect(computeShares(eq(100, 'A', ['A']))).toEqual({ A: 100 });
});

test('equal split: payer not participating keeps the rounding bonus', () => {
  expect(computeShares(eq(100, 'A', ['B', 'C', 'D']))).toEqual({ A: -2, B: 34, C: 34, D: 34 });
  expect(computeShares(eq(90, 'A', ['B', 'C', 'D']))).toEqual({ B: 30, C: 30, D: 30 });
});

test('equal split: tiny amounts can make payer share negative', () => {
  expect(computeShares(eq(1, 'A', ['A', 'B', 'C']))).toEqual({ A: -1, B: 1, C: 1 });
});

test('custom split returns the given amounts', () => {
  expect(computeShares({ ...eq(100, 'A', []), split: { mode: 'custom', amounts: { A: 20, B: 80 } } }))
    .toEqual({ A: 20, B: 80 });
});

test('detailLines shows -share, payer bonus as positive', () => {
  expect(detailLines(eq(100, 'A', ['B', 'C', 'D']))).toContainEqual({ memberId: 'A', value: 2, roundingBonus: true });
  expect(detailLines(eq(100, 'A', ['B', 'C', 'D']))).toContainEqual({ memberId: 'B', value: -34, roundingBonus: false });
  expect(detailLines(eq(100, 'A', ['A', 'B', 'C']))).toContainEqual({ memberId: 'A', value: -32, roundingBonus: false });
});

test('property: shares always sum to amount', () => {
  for (let seed = 1; seed <= 50; seed++) {
    for (const e of randomGroup(seed).expenses) {
      const sum = Object.values(computeShares(e)).reduce((a, b) => a + b, 0);
      expect(sum).toBe(e.amount);
    }
  }
});
