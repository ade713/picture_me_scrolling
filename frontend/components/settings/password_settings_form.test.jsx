import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useUpdatePassword } from '../../query/account_hooks';
import PasswordSettingsForm from './password_settings_form';

vi.mock('../../query/account_hooks', () => ({
  useUpdatePassword: vi.fn()
}));

describe('PasswordSettingsForm', () => {
  let updatePassword;

  beforeEach(() => {
    updatePassword = {
      error: null,
      isPending: false,
      mutate: vi.fn(),
      reset: vi.fn()
    };
    useUpdatePassword.mockReturnValue(updatePassword);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const fillPasswordForm = async (user, confirmation = 'new-password') => {
    await user.type(screen.getByLabelText('Current password'), 'old-password');
    await user.type(screen.getByLabelText('New password'), 'new-password');
    await user.type(screen.getByLabelText('Confirm new password'), confirmation);
  };

  it('submits the current and matching new passwords', async () => {
    const user = userEvent.setup();
    render(<PasswordSettingsForm />);

    await fillPasswordForm(user);
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(updatePassword.mutate).toHaveBeenCalledWith(
      {
        current_password: 'old-password',
        password: 'new-password',
        password_confirmation: 'new-password'
      },
      { onSuccess: expect.any(Function) }
    );
  });

  it('blocks mismatched new passwords before submission', async () => {
    const user = userEvent.setup();
    render(<PasswordSettingsForm />);

    await fillPasswordForm(user, 'different-password');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'New password and confirmation must match'
    );
    expect(updatePassword.mutate).not.toHaveBeenCalled();
  });

  it('clears sensitive fields and announces a successful update', async () => {
    const user = userEvent.setup();
    updatePassword.mutate.mockImplementation((_passwords, options) => options.onSuccess());
    render(<PasswordSettingsForm />);

    await fillPasswordForm(user);
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(screen.getByLabelText('Current password')).toHaveValue('');
    expect(screen.getByLabelText('New password')).toHaveValue('');
    expect(screen.getByLabelText('Confirm new password')).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent('Password updated successfully');
  });

  it('renders backend errors accessibly', () => {
    updatePassword.error = { errors: ['Current password is incorrect'] };

    render(<PasswordSettingsForm />);

    expect(screen.getByRole('alert')).toHaveTextContent('Current password is incorrect');
  });

  it('disables only its own controls while the password request is pending', () => {
    updatePassword.isPending = true;

    render(<PasswordSettingsForm />);

    expect(screen.getByLabelText('Current password')).toBeDisabled();
    expect(screen.getByLabelText('New password')).toBeDisabled();
    expect(screen.getByLabelText('Confirm new password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Updating password…' })).toBeDisabled();
  });

  it('disables all controls when account settings are unavailable', () => {
    render(<PasswordSettingsForm disabled />);

    expect(screen.getByLabelText('Current password')).toBeDisabled();
    expect(screen.getByLabelText('New password')).toBeDisabled();
    expect(screen.getByLabelText('Confirm new password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Update password' })).toBeDisabled();
  });
});
