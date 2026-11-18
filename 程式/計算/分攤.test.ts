import { computeShares, expenseLines } from './分攤';
import { eq, randomGroup } from './測試工具';

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

test('property: shares always sum to amount', () => {
  for (let seed = 1; seed <= 50; seed++) {
    for (const e of randomGroup(seed).expenses) {
      const sum = Object.values(computeShares(e)).reduce((a, b) => a + b, 0);
      expect(sum).toBe(e.amount);
    }
  }
});

describe('expenseLines: 每人應收／應付', () => {
  test('付款人也有分攤：應收＝別人分攤總和，括號寫自己負擔', () => {
    expect(expenseLines(eq(100, 'A', ['A', 'B', 'C']))).toEqual([
      { memberId: 'A', kind: 'receive', amount: 68, note: { type: 'own', amount: 32 } },
      { memberId: 'B', kind: 'pay', amount: 34 },
      { memberId: 'C', kind: 'pay', amount: 34 },
    ]);
  });
  test('代墊且進位多收：應收含進位', () => {
    expect(expenseLines(eq(100, 'A', ['B', 'C', 'D']))[0])
      .toEqual({ memberId: 'A', kind: 'receive', amount: 102, note: { type: 'bonus', amount: 2 } });
  });
  test('代墊剛好整除：沒有括號', () => {
    expect(expenseLines(eq(90, 'A', ['B', 'C', 'D']))[0]).toEqual({ memberId: 'A', kind: 'receive', amount: 90 });
  });
  test('只有付款人自己：自付', () => {
    expect(expenseLines(eq(100, 'A', ['A']))).toEqual([{ memberId: 'A', kind: 'self', amount: 100 }]);
  });
  test('付款人排第一，其他人照成員順序', () => {
    expect(expenseLines(eq(100, 'C', ['A', 'B', 'C'])).map((l) => l.memberId)).toEqual(['C', 'A', 'B']);
  });
});
