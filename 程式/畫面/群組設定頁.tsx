import { useState } from 'react';
import { canRemoveMember } from '../計算/成員';
import type { Group } from '../計算/資料型別';
import { newId } from '../儲存/本機儲存';
import { go } from './路由';

type Props = { group: Group; onChange: (g: Group) => void; onDelete: (id: string) => void };

export default function GroupSettings({ group, onChange, onDelete }: Props) {
  const [name, setName] = useState(group.name);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const nameTaken = (n: string, exceptId?: string) =>
    group.members.some((m) => m.name === n && m.id !== exceptId);

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    const n = newName.trim();
    if (!n) return;
    if (nameTaken(n)) return setError('已經有同名的成員');
    setError('');
    onChange({ ...group, members: [...group.members, { id: newId(), name: n }] });
    setNewName('');
  };

  const renameMember = (id: string, n: string): boolean => {
    const t = n.trim();
    if (!t || nameTaken(t, id)) {
      setError('成員名稱不可空白或重複');
      return false;
    }
    setError('');
    onChange({ ...group, members: group.members.map((m) => (m.id === id ? { ...m, name: t } : m)) });
    return true;
  };

  const saveName = () => {
    const t = name.trim();
    if (t && t !== group.name) onChange({ ...group, name: t });
  };

  return (
    <section>
      <a className="back" href={`#/group/${group.id}`}>‹ 返回</a>
      <h1>群組設定</h1>

      <form className="card form" onSubmit={(e) => { e.preventDefault(); saveName(); }}>
        <label>
          群組名稱
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} enterKeyHint="done" />
        </label>
      </form>

      <h2>成員</h2>
      <ul className="card list-plain">
        {group.members.map((m) => {
          const removable = canRemoveMember(group, m.id) && group.members.length > 2;
          const hasExpenses = !canRemoveMember(group, m.id);
          return (
            <li key={m.id} className="member-row">
              <input
                aria-label={`成員 ${m.name}`}
                defaultValue={m.name}
                onBlur={(e) => {
                  if (e.target.value.trim() !== m.name && !renameMember(m.id, e.target.value)) e.target.value = m.name;
                }}
              />
              <button
                className="btn ghost danger small"
                aria-label={`刪除 ${m.name}`}
                disabled={!removable}
                onClick={() => onChange({ ...group, members: group.members.filter((x) => x.id !== m.id) })}
              >
                刪除
              </button>
              {hasExpenses ? (
                <span className="muted small hint">已有帳目，無法刪除</span>
              ) : group.members.length <= 2 ? (
                <span className="muted small hint">群組至少要 2 人</span>
              ) : null}
            </li>
          );
        })}
      </ul>
      <form className="row" onSubmit={addMember}>
        <input aria-label="新增成員" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="新成員名字" />
        <button className="btn" type="submit">加入</button>
      </form>
      {error && <p className="error">{error}</p>}

      <div className="danger-zone">
        <button
          className="btn ghost danger"
          onClick={() => {
            if (confirm(`確定刪除「${group.name}」？所有帳目都會消失。`)) {
              onDelete(group.id);
              go('#/');
            }
          }}
        >
          刪除這個群組
        </button>
      </div>
    </section>
  );
}
