import { useCallback, useEffect, useState } from 'react';
import type { Group } from '../domain/types';
import { load, readLatest, save, STORAGE_KEY, type AppData } from './store';

export function useAppData() {
  const [data, setData] = useState<AppData>(() => load());
  const [saveOk, setSaveOk] = useState(true);

  // Another tab changed the data: reload.
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) setData(load());
    };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, []);

  /** Apply a change to the latest stored data (so other tabs' writes are kept), then save. */
  const update = useCallback(
    (fn: (d: AppData) => AppData) => {
      const base = readLatest() ?? data;
      const next = fn(base);
      setData(next);
      setSaveOk(save(next));
    },
    [data],
  );

  const replaceAll = useCallback((next: AppData) => update(() => next), [update]);

  const upsertGroup = useCallback(
    (g: Group) =>
      update((d) => {
        const updated = { ...g, updatedAt: new Date().toISOString() };
        const groups = d.groups.some((x) => x.id === g.id)
          ? d.groups.map((x) => (x.id === g.id ? updated : x))
          : [...d.groups, updated];
        return { ...d, groups };
      }),
    [update],
  );

  const deleteGroup = useCallback(
    (id: string) => update((d) => ({ ...d, groups: d.groups.filter((g) => g.id !== id) })),
    [update],
  );

  return { data, saveOk, upsertGroup, deleteGroup, replaceAll, update };
}
