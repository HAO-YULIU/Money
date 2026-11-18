import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseForm from './ExpenseForm';
import { group } from '../domain/testUtils';

test('add equal-split expense with defaults', async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(<ExpenseForm group={group(['A', 'B', 'C'], [])} onSave={onSave} onDelete={vi.fn()} />);
  await user.type(screen.getByLabelText('項目'), '拉麵');
  await user.type(screen.getByLabelText('金額'), '100');
  expect(screen.getByText(/每人約 \$34/)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '儲存' }));
  const g = onSave.mock.calls[0][0];
  expect(g.expenses[0]).toMatchObject({ title: '拉麵', amount: 100, payerId: 'A', kind: 'expense', split: { mode: 'equal', participantIds: ['A', 'B', 'C'] } });
});

test('shows validation error', async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(<ExpenseForm group={group(['A', 'B'], [])} onSave={onSave} onDelete={vi.fn()} />);
  await user.type(screen.getByLabelText('項目'), 'x');
  await user.type(screen.getByLabelText('金額'), '0');
  await user.click(screen.getByRole('button', { name: '儲存' }));
  expect(screen.getByText('請輸入正整數金額')).toBeInTheDocument();
  expect(onSave).not.toHaveBeenCalled();
});
