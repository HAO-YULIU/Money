import { useRef, useState } from 'react';
import { parseNames } from '../domain/members';
import type { Group } from '../domain/types';
import { exportJson, mergeBackup, parseBackup } from '../share/backup';
import { downloadText } from './download';
import { newId } from '../storage/store';
import type { useAppData } from '../storage/useAppData';
import { go } from './router';

type Store = ReturnType<typeof useAppData>;

export default function GroupListPage({ store }: { store: Store }) {
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const groups = [...store.data.groups].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const doExport = () =>
    downloadText(`分帳備份-${new Date().toISOString().slice(0, 10)}.json`, exportJson(store.data));

  const doImport = async (file: File) => {
    const d = parseBackup(await file.text());
    if (!d) return setMessage('這不是有效的備份檔');
    const ids = new Set(store.data.groups.map((g) => g.id));
    const conflicts = d.groups.filter((g) => ids.has(g.id)).length;
    const mode =
      conflicts && confirm(`備份裡有 ${conflicts} 個群組你已經有了。\n按「確定」用備份覆蓋，按「取消」另存一份。`)
        ? 'overwrite'
        : 'copy';
    store.update((cur) => mergeBackup(cur, d, mode));
    setMessage(`已匯入 ${d.groups.length} 個群組`);
  };

  return (
    <section>
      <div className="row between">
        <h1>我的群組</h1>
        {!creating && (
          <button className="btn primary" onClick={() => setCreating(true)}>新增群組</button>
        )}
      </div>

      {creating && (
        <NewGroupForm
          onCancel={() => setCreating(false)}
          onCreate={(g) => {
            store.upsertGroup(g);
            setCreating(false);
            go(`#/group/${g.id}`);
          }}
        />
      )}

      {groups.length === 0 && !creating && (
        <div className="empty">
          <p>還沒有群組</p>
          <p className="muted">建立一個群組，例如「日本旅遊」或「室友水電」，開始記帳。</p>
        </div>
      )}

      <ul className="list">
        {groups.map((g) => (
          <li key={g.id}>
            <a className="card link" href={`#/group/${g.id}`}>
              <strong>{g.name}</strong>
              <span className="muted">
                {g.members.length} 位成員 · {g.expenses.length} 筆帳目
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="footer-actions">
        <button className="btn ghost" onClick={doExport} disabled={!groups.length}>匯出備份</button>
        <button className="btn ghost" onClick={() => fileRef.current?.click()}>匯入備份</button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) doImport(f);
            e.target.value = '';
          }}
        />
      </div>
      {message && <p className="muted center">{message}</p>}
      <p className="muted small center">資料只存在這個瀏覽器。換手機、清除瀏覽資料，或 iPhone Safari 太久沒打開，都可能讓資料消失，記得定期匯出備份。</p>
    </section>
  );
}

function NewGroupForm({ onCreate, onCancel }: { onCreate: (g: Group) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [names, setNames] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('請輸入群組名稱');
    const list = parseNames(names);
    if (new Set(list).size !== list.length || list.length < 2) return setError('請輸入至少 2 位不重複的成員');
    const now = new Date().toISOString();
    onCreate({
      id: newId(),
      name: name.trim(),
      members: list.map((n) => ({ id: newId(), name: n })),
      expenses: [],
      createdAt: now,
      updatedAt: now,
    });
  };

  return (
    <form className="card form" onSubmit={submit}>
      <label>
        群組名稱
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="日本旅遊" autoFocus />
      </label>
      <label>
        成員（用逗號或空白分隔）
        <input value={names} onChange={(e) => setNames(e.target.value)} placeholder="小明, 小華, 小美" />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="row end">
        <button type="button" className="btn ghost" onClick={onCancel}>取消</button>
        <button type="submit" className="btn primary">建立</button>
      </div>
    </form>
  );
}
