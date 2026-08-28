import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useRequestPasswordReset } from '../../query/password_reset_hooks';
import ForgotPasswordPage from './forgot_password_page';

vi.mock('../../query/password_reset_hooks', () => ({
  useRequestPasswordReset: vi.fn()
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
  <MemoryRouter>
    <ForgotPasswordPage />
  </MemoryRouter>
);

describe('ForgotPasswordPage', () => {
  let requestPasswordReset;

  beforeEach(() => {
    requestPasswordReset = buildMutation();
    useRequestPasswordReset.mockReturnValue(requestPasswordReset);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('submits a trimmed email and exposes a logical keyboard order', async () => {
    const user = userEvent.setup();
    renderPage();

    const emailInput = screen.getByRole('textbox', { name: 'Email address' });
    const submitButton = screen.getByRole('button', { name: 'Send reset link' });

    expect(emailInput).toBeRequired();
    expect(emailInput).toHaveAttribute('maxlength', '254');
    expect(submitButton).toBeDisabled();

    await user.tab();
    expect(screen.getByRole('link', { name: 'PicMeS' })).toHaveFocus();
    await user.tab();
    expect(emailInput).toHaveFocus();

    await user.type(emailInput, ' user@example.com ');
    await user.tab();
    expect(submitButton).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Back to login' })).toHaveFocus();
    await user.tab({ shift: true });
    await user.keyboard('{Enter}');

    expect(requestPasswordReset.mutate).toHaveBeenCalledWith('user@example.com');
  });

  it('disables the form and announces a pending request', () => {
    useRequestPasswordReset.mockReturnValue(buildMutation({ isPending: true }));

    renderPage();

    expect(screen.getByRole('textbox', { name: 'Email address' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sending reset link…' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Requesting a password reset link…'
    );
    expect(screen.getByRole('status')).toHaveClass(
      'loading-indicator--compact'
    );
  });

  it('shows the uniform success response and focuses its heading', () => {
    useRequestPasswordReset.mockReturnValue(buildMutation({
      data: {
        message: 'If that address belongs to a verified account, a reset link has been sent.'
      },
      isSuccess: true
    }));

    renderPage();

    const heading = screen.getByRole('heading', { name: 'Check your email' });
    expect(heading).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent(
      'If that address belongs to a verified account, a reset link has been sent.'
    );
    expect(screen.getByRole('link', { name: 'Back to login' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('announces request errors and clears them when the email changes', async () => {
    const user = userEvent.setup();
    requestPasswordReset = buildMutation({
      error: { errors: ['Unable to request a reset link'] },
      isError: true
    });
    useRequestPasswordReset.mockReturnValue(requestPasswordReset);

    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to request a reset link'
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Email address' }),
      'user@example.com'
    );
    expect(requestPasswordReset.reset).toHaveBeenCalled();
  });
});
