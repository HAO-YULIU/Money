import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { encodeGroup } from '../share/codec';
import { save } from '../storage/store';
import { eq, group } from '../domain/testUtils';

const g = { ...group(['A', 'B'], [eq(100, 'A', ['A', 'B'])]), id: 'g1', name: '日本旅遊' };

test('valid share link shows read-only snapshot', () => {
  window.location.hash = `#/share/${encodeGroup(g)}`;
  render(<App />);
  expect(screen.getByRole('heading', { name: '日本旅遊' })).toBeInTheDocument();
  expect(screen.getByText(/唯讀快照/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '存到我的瀏覽器' })).toBeInTheDocument();
  expect(screen.queryByText('＋ 記一筆')).not.toBeInTheDocument();
});

test('invalid share link shows error', () => {
  window.location.hash = '#/share/garbage';
  render(<App />);
  expect(screen.getByText('連結無效或不完整')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '回首頁' })).toBeInTheDocument();
});

test('saving a snapshot that already exists asks overwrite or copy', async () => {
  const user = userEvent.setup();
  save({ version: 1, groups: [g] });
  window.location.hash = `#/share/${encodeGroup(g)}`;
  render(<App />);
  await user.click(screen.getByRole('button', { name: '存到我的瀏覽器' }));
  expect(screen.getByRole('button', { name: '覆蓋' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '另存一份' }));
  expect(await screen.findByRole('heading', { name: '日本旅遊（副本）' })).toBeInTheDocument();
  expect(screen.getByText('＋ 記一筆')).toBeInTheDocument();
});

test('saving a new snapshot goes straight to the group', async () => {
  const user = userEvent.setup();
  window.location.hash = `#/share/${encodeGroup(g)}`;
  render(<App />);
  await user.click(screen.getByRole('button', { name: '存到我的瀏覽器' }));
  expect(await screen.findByText('＋ 記一筆')).toBeInTheDocument();
});
