import { useState } from 'react';
import { computeBalances } from '../domain/balance';
import { formatTWD } from '../domain/money';
import { suggestTransfers } from '../domain/settle';
import { detailLines } from '../domain/split';
import type { Expense, Group } from '../domain/types';
import { newId } from '../storage/store';

type Props = { group: Group; readOnly: boolean; onChange?: (g: Group) => void; actions?: React.ReactNode };
type Tab = 'expenses' | 'balances' | 'settle';

const signed = (v: number) => (v > 0 ? '+' : '') + formatTWD(v);

export default function GroupPage({ group, readOnly, onChange, actions }: Props) {
  const [tab, setTab] = useState<Tab>('expenses');
  const name = (id: string) => group.members.find((m) => m.id === id)?.name ?? '?';

  return (
    <section>
      <div className="row between">
        <h1>{group.name}</h1>
        <div className="row">
          {actions}
          {!readOnly && <a className="btn ghost small" href={`#/group/${group.id}/settings`}>設定</a>}
        </div>
      </div>

      <div className="tabs" role="tablist">
        {([['expenses', '帳目'], ['balances', '餘額'], ['settle', '結算']] as const).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === 'expenses' && <ExpenseList group={group} readOnly={readOnly} name={name} />}
      {tab === 'balances' && <BalanceView group={group} name={name} />}
      {tab === 'settle' && <SettleView group={group} readOnly={readOnly} onChange={onChange} name={name} />}

      {!readOnly && tab === 'expenses' && (
        <div className="fab">
          <a className="btn primary block" href={`#/group/${group.id}/expense/new`}>＋ 記一筆</a>
        </div>
      )}
    </section>
  );
}

type NameFn = (id: string) => string;

function ExpenseList({ group, readOnly, name }: { group: Group; readOnly: boolean; name: NameFn }) {
  const [open, setOpen] = useState<string | null>(null);
  if (group.expenses.length === 0) {
    return <div className="empty"><p>還沒有帳目</p>{!readOnly && <p className="muted">按下方「記一筆」開始。</p>}</div>;
  }
  const sorted = group.expenses
    .map((e, i) => ({ e, i }))
    .sort((a, b) => b.e.date.localeCompare(a.e.date) || b.i - a.i)
    .map((x) => x.e);
  const dates = [...new Set(sorted.map((e) => e.date))];

  return (
    <div>
      {dates.map((date) => (
        <div key={date}>
          <div className="date-label">{date}</div>
          <ul className="list">
            {sorted.filter((e) => e.date === date).map((e) => (
              <li key={e.id} className="card expense" onClick={() => setOpen(open === e.id ? null : e.id)}>
                <ExpenseItem e={e} name={name} />
                {open === e.id && (
                  <div className="expense-detail" data-testid={`detail-${e.id}`} onClick={(ev) => ev.stopPropagation()}>
                    {e.kind === 'expense' && (
                      <>
                        {detailLines(e).map((l) => (
                          <div key={l.memberId} className="line">
                            <span>{name(l.memberId)}{l.roundingBonus && <span className="muted small">（進位多收）</span>}</span>
                            <span className={l.value > 0 ? 'pos' : l.value < 0 ? 'neg' : ''}>{signed(l.value)}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {!readOnly && (
                      <div className="row end" style={{ marginTop: 8 }}>
                        <a className="btn small" href={`#/group/${group.id}/expense/${e.id}`}>編輯</a>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ExpenseItem({ e, name }: { e: Expense; name: NameFn }) {
  if (e.kind === 'repayment') {
    const to = Object.keys(e.split.mode === 'custom' ? e.split.amounts : {})[0];
    return (
      <div className="expense-head">
        <span>✓ {name(e.payerId)} 還款給 {name(to)}</span>
        <span className="expense-amount muted">{formatTWD(e.amount)}</span>
      </div>
    );
  }
  return (
    <>
      <div className="expense-head">
        <span className="expense-title">{e.title}</span>
        <span className="expense-amount">{formatTWD(e.amount)}</span>
      </div>
      <div className="muted small">
        {name(e.payerId)} 付款 · {e.split.mode === 'equal' ? `${e.split.participantIds.length} 人平分` : '各自金額'}
      </div>
    </>
  );
}

function BalanceView({ group, name }: { group: Group; name: NameFn }) {
  const b = computeBalances(group);
  return (
    <ul className="card list-plain">
      {group.members.map((m) => {
        const v = b[m.id] ?? 0;
        return (
          <li key={m.id} className="line" data-testid={`balance-${m.id}`}>
            <span>{name(m.id)}</span>
            <span>
              <span className="muted small">{v > 0 ? '應收' : v < 0 ? '應付' : '已結清'}</span>{' '}
              <span className={`money ${v > 0 ? 'pos' : v < 0 ? 'neg' : ''}`}>{formatTWD(Math.abs(v))}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function SettleView({ group, readOnly, onChange, name }: { group: Group; readOnly: boolean; onChange?: (g: Group) => void; name: NameFn }) {
  const transfers = suggestTransfers(computeBalances(group));
  if (transfers.length === 0) return <div className="empty"><p>大家都結清了 🎉</p></div>;

  const markPaid = (fromId: string, toId: string, amount: number) => {
    const d = new Date();
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const repay: Expense = {
      id: newId(), title: '還款', amount, payerId: fromId, date, kind: 'repayment',
      split: { mode: 'custom', amounts: { [toId]: amount } },
    };
    onChange?.({ ...group, expenses: [...group.expenses, repay] });
  };

  return (
    <>
      <p className="muted small">照下面轉帳，大家就結清了：</p>
      <ul className="list">
        {transfers.map((t) => (
          <li key={`${t.fromId}-${t.toId}`} className="card transfer" data-testid="transfer">
            <span>{name(t.fromId)} → {name(t.toId)} <span className="money">{formatTWD(t.amount)}</span></span>
            {!readOnly && (
              <button className="btn small" onClick={() => markPaid(t.fromId, t.toId, t.amount)}>標記已還款</button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
