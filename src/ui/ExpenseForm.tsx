import { useState } from 'react';
import { formatTWD, parseAmount } from '../domain/money';
import type { Expense, Group } from '../domain/types';
import { newId } from '../storage/store';
import { validateExpense, type ExpenseDraft } from './validateExpense';

type Props = {
  group: Group;
  expense?: Expense;
  onSave: (g: Group) => void;
  onDelete: (g: Group) => void;
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function initialDraft(group: Group, e?: Expense): ExpenseDraft {
  const allIds = group.members.map((m) => m.id);
  if (!e) {
    return { title: '', amount: '', payerId: allIds[0], date: today(), mode: 'equal', participantIds: allIds, customAmounts: {} };
  }
  return {
    title: e.title,
    amount: String(e.amount),
    payerId: e.payerId,
    date: e.date,
    mode: e.split.mode,
    participantIds: e.split.mode === 'equal' ? e.split.participantIds : allIds,
    customAmounts:
      e.split.mode === 'custom'
        ? Object.fromEntries(Object.entries(e.split.amounts).map(([k, v]) => [k, String(v)]))
        : {},
  };
}

export default function ExpenseForm({ group, expense, onSave, onDelete }: Props) {
  const [d, setD] = useState<ExpenseDraft>(() => initialDraft(group, expense));
  const [error, setError] = useState('');
  const set = (patch: Partial<ExpenseDraft>) => setD((x) => ({ ...x, ...patch }));
  const isRepayment = expense?.kind === 'repayment';
  const back = `#/group/${group.id}`;

  const amount = parseAmount(d.amount);
  const customSum = Object.values(d.customAmounts).reduce((s, v) => s + (parseAmount(v) ?? 0), 0);

  const toggle = (id: string) =>
    set({
      participantIds: d.participantIds.includes(id)
        ? d.participantIds.filter((x) => x !== id)
        : group.members.map((m) => m.id).filter((x) => x === id || d.participantIds.includes(x)),
    });

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    let draft = d;
    if (isRepayment && expense.split.mode === 'custom') {
      const receiverId = Object.keys(expense.split.amounts)[0];
      if (receiverId === d.payerId) return setError('還款人和收款人不能是同一人');
      draft = { ...d, mode: 'custom', customAmounts: { [receiverId]: d.amount } };
    }
    const r = validateExpense(draft);
    if (!r.ok) return setError(r.error);
    const e: Expense = {
      id: expense?.id ?? newId(),
      title: d.title.trim(),
      amount: r.amount,
      payerId: d.payerId,
      date: d.date || today(),
      split: r.split,
      kind: expense?.kind ?? 'expense',
    };
    const expenses = expense ? group.expenses.map((x) => (x.id === e.id ? e : x)) : [...group.expenses, e];
    onSave({ ...group, expenses });
  };

  return (
    <section>
      <a className="back" href={back}>‹ 返回</a>
      <h1>{expense ? '編輯帳目' : '記一筆'}</h1>
      <form className="card form" onSubmit={submit}>
        <label>
          項目
          <input value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder="例如：晚餐" />
        </label>
        <label>
          金額
          <input inputMode="numeric" value={d.amount} onChange={(e) => set({ amount: e.target.value })} placeholder="0" />
        </label>
        <div className="row">
          <label style={{ flex: 1 }}>
            誰付的
            <select value={d.payerId} onChange={(e) => set({ payerId: e.target.value })}>
              {group.members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>
          <label style={{ flex: 1 }}>
            日期
            <input type="date" value={d.date} onChange={(e) => set({ date: e.target.value })} />
          </label>
        </div>

        {!isRepayment && (
          <>
            <div className="seg" role="group" aria-label="分攤方式">
              <button type="button" aria-pressed={d.mode === 'equal'} onClick={() => set({ mode: 'equal' })}>平分</button>
              <button type="button" aria-pressed={d.mode === 'custom'} onClick={() => set({ mode: 'custom' })}>各自金額</button>
            </div>

            {d.mode === 'equal' ? (
              <>
                <div className="check-grid">
                  {group.members.map((m) => (
                    <label key={m.id} className="check">
                      <input type="checkbox" checked={d.participantIds.includes(m.id)} onChange={() => toggle(m.id)} />
                      {m.name}
                    </label>
                  ))}
                </div>
                {amount && d.participantIds.length > 0 && (
                  <p className="muted small">
                    {d.participantIds.length} 人分攤，每人約 {formatTWD(Math.ceil(amount / d.participantIds.length))}
                    （除不盡時零頭歸付款人）
                  </p>
                )}
              </>
            ) : (
              <>
                {group.members.map((m) => (
                  <div key={m.id} className="custom-row">
                    <span>{m.name}</span>
                    <input
                      aria-label={`${m.name} 的金額`}
                      inputMode="numeric"
                      value={d.customAmounts[m.id] ?? ''}
                      onChange={(e) => set({ customAmounts: { ...d.customAmounts, [m.id]: e.target.value } })}
                      placeholder="0"
                    />
                  </div>
                ))}
                <p className={`small ${amount !== null && customSum !== amount ? 'neg' : 'muted'}`}>
                  已分配 {formatTWD(customSum)}
                  {amount !== null && ` / ${formatTWD(amount)}`}
                </p>
              </>
            )}
          </>
        )}

        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn primary block">儲存</button>
      </form>

      {expense && (
        <div className="danger-zone">
          <button
            className="btn ghost danger"
            onClick={() => {
              if (confirm(`確定刪除「${expense.title}」？`))
                onDelete({ ...group, expenses: group.expenses.filter((x) => x.id !== expense.id) });
            }}
          >
            刪除這筆
          </button>
        </div>
      )}
    </section>
  );
}
