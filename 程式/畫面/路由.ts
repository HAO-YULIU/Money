import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'group'; groupId: string }
  | { name: 'groupSettings'; groupId: string }
  | { name: 'expenseNew'; groupId: string }
  | { name: 'expenseEdit'; groupId: string; expenseId: string }
  | { name: 'share'; data: string }
  | { name: 'notFound' };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '');
  if (path === '' || path === '/') return { name: 'home' };
  const share = path.match(/^\/share\/(.+)$/);
  if (share) return { name: 'share', data: share[1] };
  let parts: string[];
  try {
    parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    return { name: 'notFound' };
  }
  if (parts[0] === 'group' && parts[1]) {
    const groupId = parts[1];
    if (parts.length === 2) return { name: 'group', groupId };
    if (parts.length === 3 && parts[2] === 'settings') return { name: 'groupSettings', groupId };
    if (parts.length === 4 && parts[2] === 'expense')
      return parts[3] === 'new' ? { name: 'expenseNew', groupId } : { name: 'expenseEdit', groupId, expenseId: parts[3] };
  }
  return { name: 'notFound' };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo?.(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function go(hash: string): void {
  window.location.hash = hash;
}
