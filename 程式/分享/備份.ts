import type { Group } from '../計算/資料型別';
import { newId, type AppData } from '../儲存/本機儲存';
import { isValidGroup } from './連結編碼';

export function exportJson(d: AppData): string {
  return JSON.stringify(d, null, 2);
}

export function parseBackup(text: string): AppData | null {
  try {
    const d = JSON.parse(text);
    if (!d || d.version !== 1 || !Array.isArray(d.groups) || !d.groups.every(isValidGroup)) return null;
    return { version: 1, groups: d.groups };
  } catch {
    return null;
  }
}

/** Add backup groups to current data; groups with an existing id are overwritten or kept as a copy. */
export function mergeBackup(current: AppData, incoming: AppData, onConflict: 'overwrite' | 'copy'): AppData {
  let out = current;
  for (const g of incoming.groups) {
    const exists = out.groups.some((x) => x.id === g.id);
    out = importGroup(out, g, exists ? onConflict : 'overwrite');
  }
  return out;
}

export function importGroup(d: AppData, g: Group, mode: 'overwrite' | 'copy'): AppData {
  if (mode === 'copy') {
    return { ...d, groups: [...d.groups, { ...g, id: newId(), name: `${g.name}（副本）` }] };
  }
  const exists = d.groups.some((x) => x.id === g.id);
  return { ...d, groups: exists ? d.groups.map((x) => (x.id === g.id ? g : x)) : [...d.groups, g] };
}
