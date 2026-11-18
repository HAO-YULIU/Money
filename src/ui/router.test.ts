import { parseHash } from './router';

test('parseHash', () => {
  expect(parseHash('')).toEqual({ name: 'home' });
  expect(parseHash('#/')).toEqual({ name: 'home' });
  expect(parseHash('#/group/abc')).toEqual({ name: 'group', groupId: 'abc' });
  expect(parseHash('#/group/abc/settings')).toEqual({ name: 'groupSettings', groupId: 'abc' });
  expect(parseHash('#/group/abc/expense/new')).toEqual({ name: 'expenseNew', groupId: 'abc' });
  expect(parseHash('#/group/abc/expense/e1')).toEqual({ name: 'expenseEdit', groupId: 'abc', expenseId: 'e1' });
  expect(parseHash('#/share/N4Ig-x_y')).toEqual({ name: 'share', data: 'N4Ig-x_y' });
  expect(parseHash('#/what')).toEqual({ name: 'notFound' });
});
