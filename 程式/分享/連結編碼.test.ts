import { encodeGroup, decodeGroup, isValidGroup } from './連結編碼';
import { eq, group } from '../計算/測試工具';

const g = group(['A', 'B', 'C'], [eq(100, 'A', ['A', 'B', 'C'])]);

test('encode/decode roundtrip', () => {
  expect(decodeGroup(encodeGroup(g))).toEqual(g);
});

test('decodeGroup returns null for garbage', () => {
  expect(decodeGroup('xyz')).toBeNull();
  expect(decodeGroup('')).toBeNull();
  const s = encodeGroup(g);
  expect(decodeGroup(s.slice(0, Math.floor(s.length / 2)))).toBeNull();
});

test('isValidGroup rejects expense referencing unknown member', () => {
  expect(isValidGroup(g)).toBe(true);
  expect(isValidGroup(group(['A', 'B'], [eq(100, 'Z', ['A', 'B'])]))).toBe(false);
  expect(isValidGroup(group(['A', 'B'], [eq(100, 'A', ['A', 'Z'])]))).toBe(false);
  expect(isValidGroup({ ...g, members: 'nope' })).toBe(false);
  expect(isValidGroup(null)).toBe(false);
});
