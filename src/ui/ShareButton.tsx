import { useState } from 'react';
import type { Group } from '../domain/types';
import { shareUrl } from '../share/codec';

const LONG_URL = 8000;

export default function ShareButton({ group }: { group: Group }) {
  const [msg, setMsg] = useState('');
  const [note, setNote] = useState('');
  const [fallback, setFallback] = useState('');
  const close = () => { setMsg(''); setNote(''); setFallback(''); };

  const share = async () => {
    const url = shareUrl(group);
    const warn = url.length > LONG_URL ? '帳目較多，連結可能在部分 App 被截斷，建議改用匯出備份。' : '';
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `${group.name} 分帳`, url });
        setNote(warn);
        return;
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setMsg('已複製連結');
      setNote(warn);
      setFallback('');
      if (!warn) setTimeout(close, 2500);
    } catch {
      setFallback(url);
      setMsg('請手動複製下面的連結');
      setNote(warn);
    }
  };

  return (
    <>
      <button className="btn small" onClick={share}>分享</button>
      {(msg || note) && (
        <div className="toast" role="status" onClick={close}>
          {msg && <span>{msg}</span>}
          {note && <span className="small">{note}</span>}
          {fallback && <input readOnly value={fallback} onFocus={(e) => e.target.select()} onClick={(e) => e.stopPropagation()} />}
        </div>
      )}
    </>
  );
}
