import LZString from 'lz-string';
import type { Group } from '../domain/types';

const isStr = (x: unknown): x is string => typeof x === 'string';
const isPosInt = (x: unknown): x is number => typeof x === 'number' && Number.isSafeInteger(x) && x > 0;

/** Structural check, including that every member id referenced by an expense exists. */
export function isValidGroup(x: unknown): x is Group {
  if (!x || typeof x !== 'object') return false;
  const g = x as Record<string, unknown>;
  if (!isStr(g.id) || !isStr(g.name) || !Array.isArray(g.members) || !Array.isArray(g.expenses)) return false;
  if (!isStr(g.createdAt) || !isStr(g.updatedAt)) return false;
  const ids = new Set<string>();
  for (const m of g.members) {
    if (!m || !isStr(m.id) || !isStr(m.name) || ids.has(m.id)) return false;
    ids.add(m.id);
  }
  const expenseIds = new Set<string>();
  for (const e of g.expenses) {
    if (!e || !isStr(e.id) || !isStr(e.title) || !isPosInt(e.amount) || !isStr(e.date)) return false;
    if (expenseIds.has(e.id)) return false;
    expenseIds.add(e.id);
    if (e.kind !== 'expense' && e.kind !== 'repayment') return false;
    if (!ids.has(e.payerId)) return false;
    const s = e.split;
    if (s?.mode === 'equal') {
      if (!Array.isArray(s.participantIds) || s.participantIds.length === 0) return false;
      if (!s.participantIds.every((id: unknown) => isStr(id) && ids.has(id))) return false;
      if (new Set(s.participantIds).size !== s.participantIds.length) return false;
    } else if (s?.mode === 'custom') {
      if (!s.amounts || typeof s.amounts !== 'object') return false;
      let sum = 0;
      for (const [id, v] of Object.entries(s.amounts)) {
        if (!ids.has(id) || typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0) return false;
        sum += v;
      }
      if (sum !== e.amount) return false;
    } else return false;
  }
  return true;
}

export function encodeGroup(g: Group): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(g));
}

export function decodeGroup(s: string): Group | null {
  if (!s) return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(s);
    if (!json) return null;
    const g = JSON.parse(json);
    return isValidGroup(g) ? g : null;
  } catch {
    return null;
  }
}

export function shareUrl(g: Group): string {
  return `${location.origin}${import.meta.env.BASE_URL}#/share/${encodeGroup(g)}`;
}
