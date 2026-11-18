import { formatTWD, parseAmount } from './money';

test('formatTWD', () => {
  expect(formatTWD(1234)).toBe('$1,234');
  expect(formatTWD(0)).toBe('$0');
  expect(formatTWD(-34)).toBe('−$34');
});

test('parseAmount accepts only positive integers', () => {
  expect(parseAmount('100')).toBe(100);
  expect(parseAmount(' 1,200 ')).toBe(1200);
  for (const bad of ['0', '-5', '1.5', '', 'abc', '1e3']) expect(parseAmount(bad)).toBeNull();
});
