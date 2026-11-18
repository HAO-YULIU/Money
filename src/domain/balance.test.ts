import { computeBalances } from './balance';
import { eq, group, randomGroup } from './testUtils';
import type { Expense } from './types';

test('payer fronting for others gets amount plus rounding bonus', () => {
  const g = group(['A', 'B', 'C', 'D', 'E'], [eq(100, 'A', ['B', 'C', 'D'])]);
  expect(computeBalances(g)).toEqual({ A: 102, B: -34, C: -34, D: -34, E: 0 });
});

test('repayment reduces balances', () => {
  const repay: Expense = {
    id: 'r', title: '還款', amount: 34, payerId: 'B', date: '2026-11-18', kind: 'repayment',
    split: { mode: 'custom', amounts: { A: 34 } },
  };
  const g = group(['A', 'B', 'C', 'D'], [eq(100, 'A', ['B', 'C', 'D']), repay]);
  expect(computeBalances(g)).toMatchObject({ A: 68, B: 0, C: -34, D: -34 });
});

test('property: balances always sum to zero', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const total = Object.values(computeBalances(randomGroup(seed))).reduce((a, b) => a + b, 0);
    expect(total).toBe(0);
  }
});
