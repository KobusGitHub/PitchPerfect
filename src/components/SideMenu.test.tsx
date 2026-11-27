import { IonApp } from '@ionic/react';
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import SideMenu from './SideMenu';

const adminState = { isAdmin: false };

vi.mock('../auth/useAuth', () => ({
  useAuth: () => ({ user: { email: 'me@example.com' }, signOut: vi.fn() }),
}));

vi.mock('../users/useIsAdmin', () => ({
  useIsAdmin: () => ({ isAdmin: adminState.isAdmin, loading: false }),
}));

const renderMenu = (): void => {
  render(
    <IonApp>
      <MemoryRouter>
        <SideMenu />
      </MemoryRouter>
    </IonApp>,
  );
};

describe('SideMenu', () => {
  test('hides the Users item from non-admins', () => {
    adminState.isAdmin = false;
    renderMenu();
    expect(document.querySelector('[router-link="/home"]')).not.toBeNull();
    expect(document.querySelector('[router-link="/users"]')).toBeNull();
  });

  test('shows the Users item to admins', () => {
    adminState.isAdmin = true;
    renderMenu();
    expect(document.querySelector('[router-link="/users"]')).not.toBeNull();
  });
});
