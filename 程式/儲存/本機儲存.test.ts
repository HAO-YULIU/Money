import { load, save, STORAGE_KEY } from './本機儲存';
import { group } from '../計算/測試工具';

afterEach(() => vi.restoreAllMocks());

test('load returns empty when nothing stored', () => {
  expect(load()).toEqual({ version: 1, groups: [] });
});

test('save then load roundtrip', () => {
  const d = { version: 1 as const, groups: [group(['A', 'B'], [])] };
  expect(save(d)).toBe(true);
  expect(load()).toEqual(d);
});

test('load backs up corrupt JSON and returns empty', () => {
  localStorage.setItem(STORAGE_KEY, '{not json');
  expect(load()).toEqual({ version: 1, groups: [] });
  expect(localStorage.getItem(STORAGE_KEY + '-corrupt')).toBe('{not json');
});

test('load ignores data with wrong version', () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, groups: [] }));
  expect(load()).toEqual({ version: 1, groups: [] });
});

test('save returns false when setItem throws', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  expect(save({ version: 1, groups: [] })).toBe(false);
});

test('load returns empty when localStorage getter throws', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
  expect(load()).toEqual({ version: 1, groups: [] });
});
