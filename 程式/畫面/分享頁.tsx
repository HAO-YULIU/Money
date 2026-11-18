import { useMemo, useState } from 'react';
import { decodeGroup } from '../分享/連結編碼';
import { importGroup } from '../分享/備份';
import type { useAppData } from '../儲存/使用資料';
import { NotFound } from './主程式';
import GroupPage from './群組頁';
import { go } from './路由';

type Store = ReturnType<typeof useAppData>;

export default function SharePage({ data, store }: { data: string; store: Store }) {
  const group = useMemo(() => decodeGroup(data), [data]);
  const [asking, setAsking] = useState(false);
  if (!group) return <NotFound text="連結無效或不完整" />;

  const exists = store.data.groups.some((g) => g.id === group.id);
  const doImport = (mode: 'overwrite' | 'copy') => {
    const next = importGroup(store.data, group, mode);
    store.replaceAll(next);
    const target = mode === 'copy' ? next.groups[next.groups.length - 1] : group;
    go(`#/group/${target.id}`);
  };

  return (
    <>
      <div className="notice">
        這是朋友分享的<strong>唯讀快照</strong>，不會自動更新。
        {!asking && (
          <div style={{ marginTop: 8 }}>
            <button className="btn small" onClick={() => (exists ? setAsking(true) : doImport('overwrite'))}>
              存到我的瀏覽器
            </button>
          </div>
        )}
        {asking && (
          <div style={{ marginTop: 8 }}>
            <p className="small" style={{ margin: '0 0 6px' }}>你已經有這個群組了，要怎麼處理？</p>
            <div className="row">
              <button className="btn small" onClick={() => doImport('overwrite')}>覆蓋</button>
              <button className="btn small" onClick={() => doImport('copy')}>另存一份</button>
              <button className="btn ghost small" onClick={() => setAsking(false)}>取消</button>
            </div>
          </div>
        )}
      </div>
      <GroupPage group={group} readOnly />
    </>
  );
}
