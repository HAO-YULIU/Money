import type { Group } from '../domain/types';
import { newId, type AppData } from '../storage/store';
import { isValidGroup } from './codec';

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

export function importGroup(d: AppData, g: Group, mode: 'overwrite' | 'copy'): AppData {
  if (mode === 'copy') {
    return { ...d, groups: [...d.groups, { ...g, id: newId(), name: `${g.name}（副本）` }] };
  }
  const exists = d.groups.some((x) => x.id === g.id);
  return { ...d, groups: exists ? d.groups.map((x) => (x.id === g.id ? g : x)) : [...d.groups, g] };
}
