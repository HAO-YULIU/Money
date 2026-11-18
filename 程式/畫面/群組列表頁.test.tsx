import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './主程式';

test('create a group from the home page', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByText('還沒有群組')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '新增群組' }));
  await user.type(screen.getByLabelText('群組名稱'), '日本旅遊');
  await user.type(screen.getByLabelText('成員（用逗號或空白分隔）'), '小明, 小華');
  await user.click(screen.getByRole('button', { name: '建立' }));
  // navigates to the group page
  expect(await screen.findByRole('heading', { name: '日本旅遊' })).toBeInTheDocument();
  window.location.hash = '#/';
  await screen.findByRole('heading', { name: '我的群組' });
  expect(screen.getByText('日本旅遊')).toBeInTheDocument();
  expect(screen.getByText(/2 位成員/)).toBeInTheDocument();
});

test('create requires at least 2 distinct members', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: '新增群組' }));
  await user.type(screen.getByLabelText('群組名稱'), 'X');
  await user.type(screen.getByLabelText('成員（用逗號或空白分隔）'), '小明 小明');
  await user.click(screen.getByRole('button', { name: '建立' }));
  expect(screen.getByText('請輸入至少 2 位不重複的成員')).toBeInTheDocument();
});
