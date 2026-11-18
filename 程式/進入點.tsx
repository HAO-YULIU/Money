import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './畫面/主程式';
import ErrorBoundary from './畫面/錯誤保護';
import './畫面/樣式.css';

// Ask the browser not to evict our localStorage (helps on Safari).
navigator.storage?.persist?.().catch(() => {});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
