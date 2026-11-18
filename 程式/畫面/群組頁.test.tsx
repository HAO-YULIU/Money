import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupPage from './群組頁';
import { group } from '../計算/測試工具';
import type { Expense } from '../計算/資料型別';

const dinner: Expense = {
  id: 'e1', title: '晚餐', amount: 100, payerId: 'A', date: '2026-11-18', kind: 'expense',
  split: { mode: 'equal', participantIds: ['B', 'C', 'D'] },
};
const g = { ...group(['A', 'B', 'C', 'D'], [dinner]), name: '旅行' };

test('每筆帳目直接顯示應收應付（不用點開）', () => {
  render(<GroupPage group={g} readOnly={false} onChange={vi.fn()} />);
  const card = screen.getByTestId('expense-e1');
  expect(within(card).getByText('應收 $102')).toBeInTheDocument();
  expect(within(card).getByText('（含進位多收 $2）')).toBeInTheDocument();
  expect(within(card).getAllByText('應付 $34')).toHaveLength(3);
});

test('最上方顯示總計', () => {
  render(<GroupPage group={g} readOnly={false} onChange={vi.fn()} />);
  const summary = screen.getByTestId('summary');
  expect(within(screen.getByTestId('balance-A')).getByText('應收 $102')).toBeInTheDocument();
  expect(within(screen.getByTestId('balance-B')).getByText('應付 $34')).toBeInTheDocument();
  expect(summary).toHaveTextContent('目前總計');
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
  expect(screen.queryByText('編輯')).not.toBeInTheDocument();
  await user.click(screen.getByRole('tab', { name: '結算' }));
  expect(screen.queryByRole('button', { name: '標記已還款' })).not.toBeInTheDocument();
});
