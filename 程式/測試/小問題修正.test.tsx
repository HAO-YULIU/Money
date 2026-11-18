import { render, screen, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupSettings from '../畫面/群組設定頁';
import { validateExpense } from '../畫面/檢查帳目';
import { useAppData } from '../儲存/使用資料';
import { newId } from '../儲存/本機儲存';
import { group, eq } from '../計算/測試工具';

afterEach(() => vi.restoreAllMocks());

test('改名重複時，輸入框恢復原本名字', async () => {
  const user = userEvent.setup();
  render(<GroupSettings group={group(['A', 'B'], [])} onChange={vi.fn()} onDelete={vi.fn()} />);
  const input = screen.getByLabelText('成員 A') as HTMLInputElement;
  await user.clear(input);
  await user.type(input, 'B');
  await user.tab();
  expect(screen.getByText('成員名稱不可空白或重複')).toBeInTheDocument();
  expect(input.value).toBe('A');
});

test('只剩 2 人時說明為什麼不能刪除', () => {
  render(<GroupSettings group={group(['A', 'B'], [])} onChange={vi.fn()} onDelete={vi.fn()} />);
  expect(screen.getAllByText('群組至少要 2 人')).toHaveLength(2);
});

test('群組名稱按 Enter 就儲存', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<GroupSettings group={group(['A', 'B'], [])} onChange={onChange} onDelete={vi.fn()} />);
  const input = screen.getByLabelText('群組名稱');
  await user.clear(input);
  await user.type(input, '新名字{Enter}');
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ name: '新名字' }));
});

test("各自金額填 '00' 視為空白", () => {
  const r = validateExpense({ title: 'x', amount: '100', payerId: 'A', date: '2026-11-18', mode: 'custom', participantIds: [], customAmounts: { A: '00', B: '100' } });
  expect(r).toEqual({ ok: true, amount: 100, split: { mode: 'custom', amounts: { B: 100 } } });
});

test('瀏覽器無法儲存時，一打開就顯示警告', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  const { result } = renderHook(() => useAppData());
  expect(result.current.saveOk).toBe(false);
});

test('新 id 夠短，讓分享連結不會太長', () => {
  const id = newId();
  expect(id.length).toBeLessThanOrEqual(10);
  expect(new Set(Array.from({ length: 1000 }, newId)).size).toBe(1000);
  void eq;
});
