import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupPage from './GroupPage';
import { group } from '../domain/testUtils';
import type { Expense } from '../domain/types';

const dinner: Expense = {
  id: 'e1', title: '晚餐', amount: 100, payerId: 'A', date: '2026-11-18', kind: 'expense',
  split: { mode: 'equal', participantIds: ['B', 'C', 'D'] },
};
const g = { ...group(['A', 'B', 'C', 'D'], [dinner]), name: '旅行' };

test('expense detail shows payer bonus and others negative', async () => {
  const user = userEvent.setup();
  render(<GroupPage group={g} readOnly={false} onChange={vi.fn()} />);
  await user.click(screen.getByText('晚餐'));
  const detail = screen.getByTestId('detail-e1');
  expect(within(detail).getByText('+$2')).toBeInTheDocument();
  expect(within(detail).getByText(/進位多收/)).toBeInTheDocument();
  expect(within(detail).getAllByText('−$34')).toHaveLength(3);
});

test('balances tab', async () => {
  const user = userEvent.setup();
  render(<GroupPage group={g} readOnly={false} onChange={vi.fn()} />);
  await user.click(screen.getByRole('tab', { name: '餘額' }));
  const row = screen.getByTestId('balance-A');
  expect(within(row).getByText('應收')).toBeInTheDocument();
  expect(within(row).getByText('$102')).toBeInTheDocument();
});

test('settle tab: mark repaid adds repayment', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<GroupPage group={g} readOnly={false} onChange={onChange} />);
  await user.click(screen.getByRole('tab', { name: '結算' }));
  const items = screen.getAllByTestId('transfer');
  expect(items).toHaveLength(3);
  expect(items[0]).toHaveTextContent('→ A');
  expect(items[0]).toHaveTextContent('$34');
  await user.click(within(items[0]).getByRole('button', { name: '標記已還款' }));
  const next = onChange.mock.calls[0][0];
  const repay = next.expenses.find((e: Expense) => e.kind === 'repayment');
  expect(repay).toMatchObject({ amount: 34, split: { mode: 'custom', amounts: { A: 34 } } });
});

test('read-only hides editing controls', async () => {
  const user = userEvent.setup();
  render(<GroupPage group={g} readOnly />);
  expect(screen.queryByText('＋ 記一筆')).not.toBeInTheDocument();
  expect(screen.queryByText('設定')).not.toBeInTheDocument();
  await user.click(screen.getByText('晚餐'));
  expect(screen.queryByText('編輯')).not.toBeInTheDocument();
  await user.click(screen.getByRole('tab', { name: '結算' }));
  expect(screen.queryByRole('button', { name: '標記已還款' })).not.toBeInTheDocument();
});
