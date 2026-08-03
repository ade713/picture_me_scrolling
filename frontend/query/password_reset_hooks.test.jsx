import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { patch, post } from '../util/api_client';
import {
  useRequestPasswordReset,
  useResetPassword
} from './password_reset_hooks';
import { queryKeys } from './query_keys';

vi.mock('../util/api_client', () => ({
  patch: vi.fn(),
  post: vi.fn()
}));

describe('password reset hooks', () => {
  let queryClient;
  let wrapper;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false }
      }
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('requests a reset link for the supplied email address', async () => {
    post.mockResolvedValue({
      message: 'If that address belongs to a verified account, a reset link has been sent.'
    });
    const { result } = renderHook(() => useRequestPasswordReset(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('user@example.com');
    });

    expect(post).toHaveBeenCalledWith('/api/password_reset', {
      password_reset: { email: 'user@example.com' }
    });
  });

  it('submits a reset token and new password credentials', async () => {
    patch.mockResolvedValue({
      message: 'Password has been reset. Log in with your new password.'
    });
    const passwordReset = {
      token: 'raw-token',
      password: 'new-password',
      password_confirmation: 'new-password'
    };
    queryClient.setQueryData(queryKeys.currentUser, { id: 1 });
    const { result } = renderHook(() => useResetPassword(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(passwordReset);
    });

    expect(patch).toHaveBeenCalledWith('/api/password_reset', {
      password_reset: passwordReset
    });
    expect(queryClient.getQueryData(queryKeys.currentUser)).toBeNull();
  });
});
