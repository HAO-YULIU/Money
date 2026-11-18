import { exportJson, parseBackup, importGroup } from './備份';
import { group } from '../計算/測試工具';

const g = { ...group(['A', 'B'], []), id: 'g1', name: '日本旅遊' };
const data = { version: 1 as const, groups: [g] };

test('export then parse roundtrip', () => {
  expect(parseBackup(exportJson(data))).toEqual(data);
});

test('parseBackup returns null for wrong version or junk', () => {
  expect(parseBackup(JSON.stringify({ version: 2, groups: [] }))).toBeNull();
  expect(parseBackup('hello')).toBeNull();
  expect(parseBackup(JSON.stringify({ version: 1, groups: [{ id: 1 }] }))).toBeNull();
});

test('importGroup overwrite replaces same id', () => {
  const incoming = { ...g, name: '新名字' };
  const out = importGroup(data, incoming, 'overwrite');
  expect(out.groups).toHaveLength(1);
  expect(out.groups[0].name).toBe('新名字');
});

test('importGroup as copy assigns new id and suffix', () => {
  const out = importGroup(data, g, 'copy');
  expect(out.groups).toHaveLength(2);
  expect(out.groups[1].id).not.toBe('g1');
  expect(out.groups[1].name).toBe('日本旅遊（副本）');
});
