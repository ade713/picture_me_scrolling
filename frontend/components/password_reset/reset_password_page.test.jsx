import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useResetPassword } from '../../query/password_reset_hooks';
import ResetPasswordPage from './reset_password_page';

vi.mock('../../query/password_reset_hooks', () => ({
  useResetPassword: vi.fn()
}));

const buildMutation = (overrides = {}) => ({
  data: null,
  error: null,
  isError: false,
  isPending: false,
  isSuccess: false,
  mutate: vi.fn(),
  reset: vi.fn(),
  ...overrides
});

const renderPage = () => render(
  <MemoryRouter initialEntries={['/reset-password/raw-token']}>
    <Routes>
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
    </Routes>
  </MemoryRouter>
);

describe('ResetPasswordPage', () => {
  let resetPassword;

  beforeEach(() => {
    resetPassword = buildMutation();
    useResetPassword.mockReturnValue(resetPassword);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const fillForm = async (user, confirmation = 'new-password') => {
    await user.type(screen.getByLabelText('New password'), 'new-password');
    await user.type(screen.getByLabelText('Confirm new password'), confirmation);
  };

  it('applies shared limits and submits the route token with matching passwords', async () => {
    const user = userEvent.setup();
    renderPage();

    const password = screen.getByLabelText('New password');
    const confirmation = screen.getByLabelText('Confirm new password');
    const submit = screen.getByRole('button', { name: 'Reset password' });

    expect(password).toHaveAttribute('minlength', '6');
    expect(password).toHaveAttribute('maxlength', '64');
    expect(confirmation).toHaveAttribute('minlength', '6');
    expect(confirmation).toHaveAttribute('maxlength', '64');
    expect(submit).toBeDisabled();

    await fillForm(user);
    expect(submit).toBeEnabled();
    await user.click(submit);

    expect(resetPassword.mutate).toHaveBeenCalledWith({
      token: 'raw-token',
      password: 'new-password',
      password_confirmation: 'new-password'
    });
  });

  it('blocks mismatched passwords and clears the error when edited', async () => {
    const user = userEvent.setup();
    renderPage();

    await fillForm(user, 'different-password');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'New password and confirmation must match'
    );
    expect(resetPassword.mutate).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Confirm new password'), 'x');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables controls and announces the pending state', () => {
    useResetPassword.mockReturnValue(buildMutation({ isPending: true }));

    renderPage();

    expect(screen.getByLabelText('New password')).toBeDisabled();
    expect(screen.getByLabelText('Confirm new password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Resetting password…' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Resetting your password…');
  });

  it('announces backend password validation errors in the form', () => {
    useResetPassword.mockReturnValue(buildMutation({
      error: { errors: ['Password is too short (minimum is 6 characters)'] },
      isError: true
    }));

    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Password is too short (minimum is 6 characters)'
    );
    expect(screen.getByRole('heading', { name: 'Reset your password' }))
      .toBeInTheDocument();
  });

  it.each([
    'Password reset link is invalid',
    'Password reset link has expired'
  ])('focuses the unavailable result for: %s', error => {
    useResetPassword.mockReturnValue(buildMutation({
      error: { errors: [error] },
      isError: true
    }));

    renderPage();

    const heading = screen.getByRole('heading', { name: 'Reset link unavailable' });
    expect(heading).toHaveFocus();
    expect(screen.getByRole('alert')).toHaveTextContent(error);
    expect(screen.getByRole('link', { name: 'Request a new reset link' }))
      .toHaveAttribute('href', '/forgot-password');
  });

  it('focuses and announces success before continuing to login', () => {
    useResetPassword.mockReturnValue(buildMutation({
      data: { message: 'Password has been reset. Log in with your new password.' },
      isSuccess: true
    }));

    renderPage();

    const heading = screen.getByRole('heading', { name: 'Password reset complete' });
    expect(heading).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Password has been reset. Log in with your new password.'
    );
    expect(screen.getByRole('link', { name: 'Continue to login' }))
      .toHaveAttribute('href', '/');
  });

  it('exposes a logical keyboard order', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.tab();
    expect(screen.getByRole('link', { name: 'PicMeS' })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('New password')).toHaveFocus();
    await user.type(screen.getByLabelText('New password'), 'new-password');
    await user.tab();
    expect(screen.getByLabelText('Confirm new password')).toHaveFocus();
    await user.type(screen.getByLabelText('Confirm new password'), 'new-password');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Reset password' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Back to login' })).toHaveFocus();
  });
});
