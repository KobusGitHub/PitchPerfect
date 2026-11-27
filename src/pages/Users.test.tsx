import { IonApp } from '@ionic/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, test, vi } from 'vitest';

import Users from './Users';

vi.mock('../users/userService', () => ({
  subscribeToUsers: (onChange: (users: unknown[]) => void) => {
    onChange([{ uid: 'abc', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' }]);
    return () => {};
  },
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

test('lists the users stored in Firestore', () => {
  render(
    <IonApp>
      <Users />
    </IonApp>,
  );
  expect(screen.getByText('Ada Lovelace')).toBeTruthy();
  expect(screen.getByText('ada@example.com')).toBeTruthy();
});
