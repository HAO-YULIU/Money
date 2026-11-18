import { useCallback, useState } from 'react';
import type { Group } from '../domain/types';
import { load, save, type AppData } from './store';

export function useAppData() {
  const [data, setData] = useState<AppData>(() => load());
  const [saveOk, setSaveOk] = useState(true);

  const commit = useCallback((next: AppData) => {
    setData(next);
    setSaveOk(save(next));
  }, []);

  const replaceAll = useCallback((next: AppData) => commit(next), [commit]);

  const upsertGroup = useCallback(
    (g: Group) => {
      const updated = { ...g, updatedAt: new Date().toISOString() };
      const groups = data.groups.some((x) => x.id === g.id)
        ? data.groups.map((x) => (x.id === g.id ? updated : x))
        : [...data.groups, updated];
      commit({ ...data, groups });
    },
    [data, commit],
  );

  const deleteGroup = useCallback(
    (id: string) => commit({ ...data, groups: data.groups.filter((g) => g.id !== id) }),
    [data, commit],
  );

  return { data, saveOk, upsertGroup, deleteGroup, replaceAll };
}
