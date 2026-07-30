import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useVerifyEmail } from '../../query/email_verification_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import EmailVerificationPage from './email_verification_page';

vi.mock('../../query/email_verification_hooks', () => ({
  useVerifyEmail: vi.fn()
}));

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

const buildMutation = (overrides = {}) => ({
  data: null,
  error: null,
  isError: false,
  isPending: false,
  isSuccess: false,
  mutate: vi.fn(),
  ...overrides
});

const renderPage = () => render(
  <MemoryRouter initialEntries={['/verify-email/raw-token']}>
    <Routes>
      <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
    </Routes>
  </MemoryRouter>
);

describe('EmailVerificationPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('submits the route token and announces the pending state', async () => {
    const verifyEmail = buildMutation();
    useCurrentUser.mockReturnValue({ data: null });
    useVerifyEmail.mockReturnValue(verifyEmail);

    renderPage();

    await waitFor(() => {
      expect(verifyEmail.mutate).toHaveBeenCalledWith('raw-token');
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Verifying your email address…'
    );
  });

  it('announces success, focuses the result, and continues to settings when logged in', () => {
    useCurrentUser.mockReturnValue({ data: { id: 1 } });
    useVerifyEmail.mockReturnValue(buildMutation({
      data: { message: 'Email address verified' },
      isSuccess: true
    }));

    renderPage();

    const heading = screen.getByRole('heading', { name: 'Email verified' });
    expect(heading).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Email address verified');
    expect(screen.getByRole('link', { name: 'Continue to settings' })).toHaveAttribute(
      'href',
      '/settings'
    );
  });

  it('announces an invalid link and directs logged-out visitors to login', () => {
    useCurrentUser.mockReturnValue({ data: null });
    useVerifyEmail.mockReturnValue(buildMutation({
      error: { errors: ['Verification link is invalid'] },
      isError: true
    }));

    renderPage();

    const heading = screen.getByRole('heading', {
      name: 'Verification link unavailable'
    });
    expect(heading).toHaveFocus();
    expect(screen.getByRole('alert')).toHaveTextContent('Verification link is invalid');
    expect(screen.getByText(
      'Sign in and request a new verification email from Settings.'
    )).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue to login' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('gives signed-in visitors Settings-specific invalid-link guidance', () => {
    useCurrentUser.mockReturnValue({ data: { id: 1 } });
    useVerifyEmail.mockReturnValue(buildMutation({
      error: { errors: ['Verification link is invalid'] },
      isError: true
    }));

    renderPage();

    expect(screen.getByText(
      'Return to Settings and request a new email if your address is still unverified.'
    )).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue to settings' })).toHaveAttribute(
      'href',
      '/settings'
    );
  });
});
