import type { Group } from '../計算/資料型別';
import { isValidGroup } from '../分享/連結編碼';

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

const ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

/** Short random id (10 chars, ~51 bits) — keeps share links short. */
export function newId(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ID_CHARS[b % ID_CHARS.length]).join('');
}

/** Whether the browser lets us write to localStorage right now. */
export function canSave(): boolean {
  try {
    localStorage.setItem(STORAGE_KEY + '-probe', '1');
    localStorage.removeItem(STORAGE_KEY + '-probe');
    return true;
  } catch {
    return false;
  }
}
