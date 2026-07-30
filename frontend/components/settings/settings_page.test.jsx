import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { useUpdateAvatar, useUpdateEmail, useUpdatePassword } from '../../query/account_hooks';
import { useResendEmailVerification } from '../../query/email_verification_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import { ProtectedRoute } from '../../util/route_util';
import SettingsPage from './settings_page';

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

vi.mock('../../query/account_hooks', () => ({
  useUpdateAvatar: vi.fn(),
  useUpdateEmail: vi.fn(),
  useUpdatePassword: vi.fn()
}));

vi.mock('../../query/email_verification_hooks', () => ({
  useResendEmailVerification: vi.fn()
}));

const buildCurrentUser = (overrides = {}) => ({
  id: 1,
  username: 'Athos',
  email: 'athos@example.com',
  email_verified_at: null,
  avatar_url: '/avatars/athos.png',
  account_settings_enabled: true,
  ...overrides
});

const buildMutation = (overrides = {}) => ({
  data: null,
  error: null,
  isPending: false,
  mutate: vi.fn(),
  reset: vi.fn(),
  ...overrides
});

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
    useUpdateAvatar.mockReturnValue(buildMutation());
    useUpdateEmail.mockReturnValue(buildMutation());
    useUpdatePassword.mockReturnValue(buildMutation());
    useResendEmailVerification.mockReturnValue(buildMutation());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the current user and settings sections', () => {
    useCurrentUser.mockReturnValue({ data: buildCurrentUser() });

    renderSettingsRoute();

    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Athos')).toBeInTheDocument();
    expect(screen.getByAltText('Athos avatar')).toHaveAttribute('src', '/avatars/athos.png');
    expect(screen.getByRole('heading', { level: 2, name: 'Email' })).toBeInTheDocument();
    expect(screen.getByText('Email address is not verified')).toBeInTheDocument();
    expect(screen.getByRole('button', {
      name: 'Resend verification email'
    })).toBeEnabled();
    expect(screen.getByRole('heading', { level: 2, name: 'Avatar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Password' })).toBeInTheDocument();
  });

  it('shows when the current email is verified', () => {
    useCurrentUser.mockReturnValue({
      data: buildCurrentUser({ email_verified_at: '2026-07-28T14:00:00.000Z' })
    });

    renderSettingsRoute();

    expect(screen.getByText('Verified email address')).toBeInTheDocument();
    expect(screen.queryByText('Email address is not verified')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {
      name: 'Resend verification email'
    })).not.toBeInTheDocument();
  });

  it('resends verification and announces success', async () => {
    const user = userEvent.setup();
    const resendVerification = buildMutation({
      data: { message: 'Verification email sent' }
    });
    useCurrentUser.mockReturnValue({ data: buildCurrentUser() });
    useResendEmailVerification.mockReturnValue(resendVerification);

    renderSettingsRoute();

    await user.click(screen.getByRole('button', {
      name: 'Resend verification email'
    }));

    expect(resendVerification.reset).toHaveBeenCalled();
    expect(resendVerification.mutate).toHaveBeenCalledWith();
    expect(screen.getByRole('status')).toHaveTextContent('Verification email sent');
  });

  it('shows resend errors and disables the action while pending', () => {
    useCurrentUser.mockReturnValue({ data: buildCurrentUser() });
    useResendEmailVerification.mockReturnValue(buildMutation({
      error: { errors: ['Verification email could not be sent. Please try again.'] },
      isPending: true
    }));

    renderSettingsRoute();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Verification email could not be sent. Please try again.'
    );
    expect(screen.getByRole('button', {
      name: 'Sending verification email…'
    })).toBeDisabled();
  });

  it('provides brand and back links to the dashboard', () => {
    useCurrentUser.mockReturnValue({ data: buildCurrentUser() });

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
      data: buildCurrentUser({
        username: 'PicMeS Guest',
        avatar_url: '/avatars/guest.png',
        account_settings_enabled: false
      })
    });

    renderSettingsRoute();

    expect(screen.getByRole('note')).toHaveTextContent('Shared account settings are disabled');
    expect(screen.getByLabelText('Email address')).toBeDisabled();
    expect(screen.getByLabelText('Choose a new avatar')).toBeDisabled();
    expect(screen.getByLabelText('Current password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Update avatar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Update password' })).toBeDisabled();
  });

  it('keeps avatar and password pending states independent', async () => {
    const user = userEvent.setup();
    useCurrentUser.mockReturnValue({ data: buildCurrentUser() });
    useUpdateAvatar.mockReturnValue(buildMutation({ isPending: true }));

    renderSettingsRoute();

    expect(screen.getByLabelText('Choose a new avatar')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Updating avatar…' })).toBeDisabled();
    expect(screen.getByLabelText('Current password')).toBeEnabled();

    await user.type(screen.getByLabelText('Current password'), 'old-password');
    await user.type(screen.getByLabelText('New password'), 'new-password');
    await user.type(screen.getByLabelText('Confirm new password'), 'new-password');

    expect(screen.getByRole('button', { name: 'Update password' })).toBeEnabled();
  });

  it('follows a logical keyboard order and skips unavailable submit actions', async () => {
    const user = userEvent.setup();
    useCurrentUser.mockReturnValue({ data: buildCurrentUser() });

    renderSettingsRoute();

    await user.tab();
    expect(screen.getByRole('link', { name: 'PicMeS' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Choose a new avatar')).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Email address')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', {
      name: 'Resend verification email'
    })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Current password')).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('New password')).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Confirm new password')).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('skips disabled guest settings controls in keyboard navigation', async () => {
    const user = userEvent.setup();
    useCurrentUser.mockReturnValue({
      data: buildCurrentUser({
        username: 'PicMeS Guest',
        account_settings_enabled: false
      })
    });

    renderSettingsRoute();

    await user.tab();
    expect(screen.getByRole('link', { name: 'PicMeS' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });
});
