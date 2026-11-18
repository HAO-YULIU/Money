import { canRemoveMember } from './members';
import { eq, group } from './testUtils';
import type { Expense } from './types';

test('canRemoveMember is false when member appears in any expense', () => {
  const repay: Expense = { id: 'r', title: '還款', amount: 5, payerId: 'C', date: '2026-11-18', kind: 'repayment', split: { mode: 'custom', amounts: { D: 5 } } };
  const g = group(['A', 'B', 'C', 'D', 'E'], [eq(100, 'A', ['A', 'B']), repay]);
  expect(canRemoveMember(g, 'A')).toBe(false); // payer
  expect(canRemoveMember(g, 'B')).toBe(false); // participant
  expect(canRemoveMember(g, 'C')).toBe(false); // repayment payer
  expect(canRemoveMember(g, 'D')).toBe(false); // repayment receiver
  expect(canRemoveMember(g, 'E')).toBe(true);
});
