import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupSettings from './GroupSettings';
import { eq, group } from '../domain/testUtils';

test('member with expenses cannot be removed; others can; can add member', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<GroupSettings group={group(['A', 'B', 'C'], [eq(100, 'A', ['A', 'B'])])} onChange={onChange} onDelete={vi.fn()} />);
  expect(screen.getByRole('button', { name: '刪除 A' })).toBeDisabled();
  expect(screen.getAllByText('已有帳目，無法刪除')).toHaveLength(2);
  await user.click(screen.getByRole('button', { name: '刪除 C' }));
  expect(onChange.mock.calls[0][0].members.map((m: { id: string }) => m.id)).toEqual(['A', 'B']);
  await user.type(screen.getByLabelText('新增成員'), '小美');
  await user.click(screen.getByRole('button', { name: '加入' }));
  expect(onChange.mock.calls[1][0].members.map((m: { name: string }) => m.name)).toContain('小美');
});
