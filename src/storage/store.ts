import type { Group } from '../domain/types';
import { isValidGroup } from '../share/codec';

export type AppData = { version: 1; groups: Group[] };
export const STORAGE_KEY = 'money-split-v1';

const empty = (): AppData => ({ version: 1, groups: [] });

export function load(): AppData {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return empty();
  }
  if (!raw) return empty();
  try {
    const d = JSON.parse(raw);
    if (d && d.version === 1 && Array.isArray(d.groups)) return { version: 1, groups: d.groups.filter(isValidGroup) };
    return empty();
  } catch {
    try {
      localStorage.setItem(STORAGE_KEY + '-corrupt', raw);
    } catch {
      /* ignore */
    }
    return empty();
  }
}

/** Latest stored data, or null if storage cannot be read. */
export function readLatest(): AppData | null {
  try {
    localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  return load();
}

export function save(d: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    return true;
  } catch {
    return false;
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
