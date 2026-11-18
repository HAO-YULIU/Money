import { validateExpense, type ExpenseDraft } from './validateExpense';

const base: ExpenseDraft = {
  title: '晚餐', amount: '100', payerId: 'A', date: '2026-11-18',
  mode: 'equal', participantIds: ['A', 'B'], customAmounts: {},
};

test('valid equal split', () => {
  expect(validateExpense(base)).toEqual({ ok: true, amount: 100, split: { mode: 'equal', participantIds: ['A', 'B'] } });
});

test('rejects invalid amounts', () => {
  for (const amount of ['0', '-1', '1.5', '', 'abc'])
    expect(validateExpense({ ...base, amount })).toEqual({ ok: false, error: '請輸入正整數金額' });
});

test('other validation errors', () => {
  expect(validateExpense({ ...base, title: '  ' })).toEqual({ ok: false, error: '請輸入項目名稱' });
  expect(validateExpense({ ...base, participantIds: [] })).toEqual({ ok: false, error: '請至少選一位分攤成員' });
  expect(validateExpense({ ...base, mode: 'custom', customAmounts: { A: '20', B: '70' } }))
    .toEqual({ ok: false, error: '分攤總和 $90 與金額 $100 不符' });
  expect(validateExpense({ ...base, mode: 'custom', customAmounts: { A: '20.5', B: '79.5' } }))
    .toEqual({ ok: false, error: '請輸入正整數金額' });
});

test('custom split drops blanks and zeros', () => {
  expect(validateExpense({ ...base, mode: 'custom', customAmounts: { A: '', B: '100', C: '0' } }))
    .toEqual({ ok: true, amount: 100, split: { mode: 'custom', amounts: { B: 100 } } });
});
