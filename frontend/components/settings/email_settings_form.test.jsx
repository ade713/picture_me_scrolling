import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useUpdateEmail } from '../../query/account_hooks';
import EmailSettingsForm from './email_settings_form';

vi.mock('../../query/account_hooks', () => ({
  useUpdateEmail: vi.fn()
}));

describe('EmailSettingsForm', () => {
  let updateEmail;

  beforeEach(() => {
    updateEmail = {
      error: null,
      isPending: false,
      mutate: vi.fn(),
      reset: vi.fn()
    };
    useUpdateEmail.mockReturnValue(updateEmail);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows the current email and disables unchanged submission', () => {
    render(<EmailSettingsForm currentEmail="current@example.com" />);

    expect(screen.getByLabelText('Email address')).toHaveValue('current@example.com');
    expect(screen.getByLabelText('Email address')).toHaveAttribute('maxlength', '254');
    expect(screen.getByRole('button', { name: 'Update email' })).toBeDisabled();
  });

  it('submits a changed email address', async () => {
    const user = userEvent.setup();
    render(<EmailSettingsForm currentEmail="current@example.com" />);

    const email = screen.getByLabelText('Email address');
    await user.clear(email);
    await user.type(email, 'new@example.com');
    await user.click(screen.getByRole('button', { name: 'Update email' }));

    expect(updateEmail.mutate).toHaveBeenCalledWith(
      'new@example.com',
      { onSuccess: expect.any(Function) }
    );
  });

  it('updates the field and announces success', async () => {
    const user = userEvent.setup();
    updateEmail.mutate.mockImplementation((_email, options) => {
      options.onSuccess({ email: 'normalized@example.com' });
    });
    render(<EmailSettingsForm currentEmail="" />);

    await user.type(screen.getByLabelText('Email address'), 'normalized@example.com');
    await user.click(screen.getByRole('button', { name: 'Update email' }));

    expect(screen.getByLabelText('Email address')).toHaveValue('normalized@example.com');
    expect(screen.getByRole('status')).toHaveTextContent('Email updated successfully');
  });

  it('renders backend errors and disables controls while pending', () => {
    updateEmail.error = { errors: ['Email has already been taken'] };
    updateEmail.isPending = true;

    render(<EmailSettingsForm currentEmail="current@example.com" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Email has already been taken');
    expect(screen.getByLabelText('Email address')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Updating email…' })).toBeDisabled();
  });

  it('disables all controls when account settings are unavailable', () => {
    render(<EmailSettingsForm currentEmail="" disabled />);

    expect(screen.getByLabelText('Email address')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Update email' })).toBeDisabled();
  });
});
