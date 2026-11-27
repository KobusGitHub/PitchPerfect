import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, expect, test, vi } from 'vitest';

import App from './App';

// Firebase Auth throws on an empty config, and these tests run without real credentials.
vi.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  onAuthStateChanged: (_auth: unknown, callback: (user: null) => void) => {
    callback(null);
    return () => {};
  },
  signOut: vi.fn(),
}));

beforeEach(() => {
  window.history.pushState({}, '', '/');
});

test('renders without crashing', () => {
  const { baseElement } = render(<App />);
  expect(baseElement).toBeDefined();
});

test('signed-out users are sent to the sign-in page', async () => {
  render(<App />);
  await waitFor(() => expect(window.location.pathname).toBe('/signin'));
});
