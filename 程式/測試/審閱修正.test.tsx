import { act, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { isValidGroup } from '../分享/連結編碼';
import { load, save, STORAGE_KEY } from '../儲存/本機儲存';
import { useAppData } from '../儲存/使用資料';
import { parseHash } from '../畫面/路由';
import { mergeBackup } from '../分享/備份';
import ErrorBoundary from '../畫面/錯誤保護';
import GroupPage from '../畫面/群組頁';
import { downloadText } from '../畫面/下載';
import { eq, group } from '../計算/測試工具';

const g1 = { ...group(['A', 'B'], []), id: 'g1', name: 'one' };
const g2 = { ...group(['A', 'B'], []), id: 'g2', name: 'two' };

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

test('I1: writes from another tab are not overwritten', () => {
  save({ version: 1, groups: [g1] });
  const { result } = renderHook(() => useAppData());
  // another tab saves g2 alongside g1
  save({ version: 1, groups: [g1, g2] });
  act(() => result.current.upsertGroup({ ...g1, name: 'one!' }));
  expect(load().groups.map((g) => g.id).sort()).toEqual(['g1', 'g2']);
  expect(result.current.data.groups).toHaveLength(2);
});

test('I1: storage event reloads state', () => {
  save({ version: 1, groups: [g1] });
  const { result } = renderHook(() => useAppData());
  save({ version: 1, groups: [g1, g2] });
  act(() => { window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY })); });
  expect(result.current.data.groups).toHaveLength(2);
});

test('I2: isValidGroup rejects missing timestamps and duplicate ids', () => {
  const { updatedAt: _u, ...noTs } = g1;
  expect(isValidGroup(noTs)).toBe(false);
  expect(isValidGroup({ ...g1, members: [{ id: 'A', name: 'a' }, { id: 'A', name: 'b' }] })).toBe(false);
  expect(isValidGroup(group(['A', 'B'], [eq(100, 'A', ['A', 'B', 'B'])]))).toBe(false);
});

test('I2: load drops invalid stored groups', () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, groups: [g1, { id: 'bad' }] }));
  expect(load().groups.map((g) => g.id)).toEqual(['g1']);
});

test('I2: error boundary shows fallback instead of white screen', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const Boom = () => { throw new Error('x'); };
  render(<ErrorBoundary><Boom /></ErrorBoundary>);
  expect(screen.getByText('發生錯誤')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '下載資料備份' })).toBeInTheDocument();
});

test('I2: malformed hash escape is notFound, not a crash', () => {
  expect(parseHash('#/group/%')).toEqual({ name: 'notFound' });
});

test('I4: object URL is not revoked synchronously', () => {
  vi.useFakeTimers();
  const revoke = vi.fn();
  URL.createObjectURL = vi.fn(() => 'blob:x');
  URL.revokeObjectURL = revoke;
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  downloadText('a.json', '{}');
  expect(revoke).not.toHaveBeenCalled();
  vi.advanceTimersByTime(2000);
  expect(revoke).toHaveBeenCalledWith('blob:x');
});

test('I5: backup import merges instead of replacing', () => {
  const current = { version: 1 as const, groups: [g1] };
  const incoming = { version: 1 as const, groups: [{ ...g1, name: 'old one' }, g2] };
  const keep = mergeBackup(current, incoming, 'copy');
  expect(keep.groups.map((g) => g.name)).toEqual(['one', 'old one（副本）', 'two']);
  const over = mergeBackup(current, incoming, 'overwrite');
  expect(over.groups.map((g) => g.name)).toEqual(['old one', 'two']);
});

test('spec: expense detail shows payer line', async () => {
  const user = userEvent.setup();
  render(<GroupPage group={group(['A', 'B'], [{ ...eq(100, 'A', ['A', 'B']), id: 'e1', title: '晚餐' }])} readOnly />);
  expect(within(screen.getByTestId('expense-e1')).getByText(/A 付款/)).toBeInTheDocument();
  void user;
});
