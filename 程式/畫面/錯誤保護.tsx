import { Component, type ReactNode } from 'react';
import { STORAGE_KEY } from '../儲存/本機儲存';
import { downloadText } from './下載';

export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const backup = () => {
      let raw = '';
      try {
        raw = localStorage.getItem(STORAGE_KEY) ?? '';
      } catch {
        /* ignore */
      }
      downloadText('分帳資料備份.json', raw || '{}');
    };
    return (
      <div className="app">
        <div className="empty">
          <p>發生錯誤</p>
          <p className="muted">請先下載資料備份，再回到首頁重試。</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={backup}>下載資料備份</button>
            <a className="btn primary" href="#/" onClick={() => setTimeout(() => location.reload(), 0)}>回首頁</a>
          </div>
        </div>
      </div>
    );
  }
}
