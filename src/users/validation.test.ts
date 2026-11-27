import { expect, test } from 'vitest';

import { canSaveUser } from './validation';

test('a new user needs a starting password of at least 6 characters', () => {
  const values = { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', password: '' };
  expect(canSaveUser(values, false)).toBe(false);
  expect(canSaveUser({ ...values, password: '12345' }, false)).toBe(false);
  expect(canSaveUser({ ...values, password: '123456' }, false)).toBe(true);
});

test('editing a user allows a blank password to keep the current one', () => {
  const values = { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', password: '' };
  expect(canSaveUser(values, true)).toBe(true);
  expect(canSaveUser({ ...values, password: '12345' }, true)).toBe(false);
});

test('name and email are required', () => {
  const values = { firstName: 'Ada', lastName: ' ', email: 'ada@example.com', password: '' };
  expect(canSaveUser(values, true)).toBe(false);
  expect(canSaveUser({ ...values, lastName: 'Lovelace', email: 'not-an-email' }, true)).toBe(false);
});
