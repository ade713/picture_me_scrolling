import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { useUpdateAvatar, useUpdatePassword } from '../../query/account_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import { ProtectedRoute } from '../../util/route_util';
import SettingsPage from './settings_page';

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

vi.mock('../../query/account_hooks', () => ({
  useUpdateAvatar: vi.fn(),
  useUpdatePassword: vi.fn()
}));

const LocationPath = () => {
  const location = useLocation();

  return <span data-testid="location-path">{ location.pathname }</span>;
};

const renderSettingsRoute = () => render(
  <MemoryRouter initialEntries={['/settings']}>
    <Routes>
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={ <p>Log in</p> } />
      <Route path="/dashboard" element={ <p>Dashboard</p> } />
    </Routes>
    <LocationPath />
  </MemoryRouter>
);

describe('SettingsPage', () => {
  beforeEach(() => {
    useUpdateAvatar.mockReturnValue({
      error: null,
      isPending: false,
      mutate: vi.fn(),
      reset: vi.fn()
    });
    useUpdatePassword.mockReturnValue({
      error: null,
      isPending: false,
      mutate: vi.fn(),
      reset: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the current user and settings sections', () => {
    useCurrentUser.mockReturnValue({
      data: {
        id: 1,
        username: 'Athos',
        avatar_url: '/avatars/athos.png',
        account_settings_enabled: true
      }
    });

    renderSettingsRoute();

    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Athos')).toBeInTheDocument();
    expect(screen.getByAltText('Athos avatar')).toHaveAttribute('src', '/avatars/athos.png');
    expect(screen.getByRole('heading', { level: 2, name: 'Avatar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Password' })).toBeInTheDocument();
  });

  it('provides brand and back links to the dashboard', () => {
    useCurrentUser.mockReturnValue({
      data: {
        id: 1,
        username: 'Athos',
        avatar_url: '/avatars/athos.png',
        account_settings_enabled: true
      }
    });

    renderSettingsRoute();

    expect(screen.getByRole('link', { name: 'PicMeS' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute(
      'href',
      '/dashboard'
    );
  });

  it('redirects unauthenticated visitors to login', async () => {
    useCurrentUser.mockReturnValue({ data: null });

    renderSettingsRoute();

    await waitFor(() => {
      expect(screen.getByTestId('location-path')).toHaveTextContent('/');
    });
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('explains and enforces shared guest restrictions', () => {
    useCurrentUser.mockReturnValue({
      data: {
        id: 1,
        username: 'PicMeS Guest',
        avatar_url: '/avatars/guest.png',
        account_settings_enabled: false
      }
    });

    renderSettingsRoute();

    expect(screen.getByRole('note')).toHaveTextContent('Shared account settings are disabled');
    expect(screen.getByLabelText('Choose a new avatar')).toBeDisabled();
    expect(screen.getByLabelText('Current password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Update avatar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Update password' })).toBeDisabled();
  });

  it('keeps avatar and password pending states independent', async () => {
    const user = userEvent.setup();
    useCurrentUser.mockReturnValue({
      data: {
        id: 1,
        username: 'Athos',
        avatar_url: '/avatars/athos.png',
        account_settings_enabled: true
      }
    });
    useUpdateAvatar.mockReturnValue({
      error: null,
      isPending: true,
      mutate: vi.fn(),
      reset: vi.fn()
    });

    renderSettingsRoute();

    expect(screen.getByLabelText('Choose a new avatar')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Updating avatar…' })).toBeDisabled();
    expect(screen.getByLabelText('Current password')).toBeEnabled();

    await user.type(screen.getByLabelText('Current password'), 'old-password');
    await user.type(screen.getByLabelText('New password'), 'new-password');
    await user.type(screen.getByLabelText('Confirm new password'), 'new-password');

    expect(screen.getByRole('button', { name: 'Update password' })).toBeEnabled();
  });
});
