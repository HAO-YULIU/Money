import { formatTWD, parseAmount } from '../計算/金額';
import type { Split } from '../計算/資料型別';

export type ExpenseDraft = {
  title: string;
  amount: string;
  payerId: string;
  date: string;
  mode: 'equal' | 'custom';
  participantIds: string[];
  customAmounts: Record<string, string>;
};

export function validateExpense(
  d: ExpenseDraft,
): { ok: true; amount: number; split: Split } | { ok: false; error: string } {
  if (!d.title.trim()) return { ok: false, error: '請輸入項目名稱' };
  const amount = parseAmount(d.amount);
  if (amount === null) return { ok: false, error: '請輸入正整數金額' };
  if (d.mode === 'equal') {
    if (d.participantIds.length === 0) return { ok: false, error: '請至少選一位分攤成員' };
    return { ok: true, amount, split: { mode: 'equal', participantIds: d.participantIds } };
  }
  const amounts: Record<string, number> = {};
  let sum = 0;
  for (const [id, raw] of Object.entries(d.customAmounts)) {
    const t = raw.trim();
    if (t === '' || /^0+$/.test(t)) continue;
    const v = parseAmount(t);
    if (v === null) return { ok: false, error: '請輸入正整數金額' };
    amounts[id] = v;
    sum += v;
  }
  if (sum !== amount) return { ok: false, error: `分攤總和 ${formatTWD(sum)} 與金額 ${formatTWD(amount)} 不符` };
  return { ok: true, amount, split: { mode: 'custom', amounts } };
}
