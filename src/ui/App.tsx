import { useAppData } from '../storage/useAppData';
import { useRoute } from './router';
import GroupListPage from './GroupListPage';
import GroupSettings from './GroupSettings';
import GroupPage from './GroupPage';

export default function App() {
  const route = useRoute();
  const store = useAppData();
  const groupId = 'groupId' in route ? route.groupId : undefined;
  const group = groupId ? store.data.groups.find((g) => g.id === groupId) : undefined;

  let body: JSX.Element;
  if (route.name === 'home') {
    body = <GroupListPage store={store} />;
  } else if (groupId && !group) {
    body = <NotFound text="找不到這個群組" />;
  } else if (route.name === 'group' && group) {
    body = <GroupPage group={group} readOnly={false} onChange={store.upsertGroup} />;
  } else if (route.name === 'groupSettings' && group) {
    body = <GroupSettings group={group} onChange={store.upsertGroup} onDelete={store.deleteGroup} />;
  } else {
    body = <NotFound text="找不到這個頁面" />;
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/">分帳</a>
      </header>
      {!store.saveOk && (
        <div className="alert" role="alert">無法儲存資料到瀏覽器，請先匯出備份。</div>
      )}
      <main>{body}</main>
    </div>
  );
}

export function NotFound({ text }: { text: string }) {
  return (
    <div className="empty">
      <p>{text}</p>
      <a className="btn" href="#/">回首頁</a>
    </div>
  );
}
