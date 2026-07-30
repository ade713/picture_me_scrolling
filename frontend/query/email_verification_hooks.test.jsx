import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { patch, post } from '../util/api_client';
import {
  useResendEmailVerification,
  useVerifyEmail
} from './email_verification_hooks';
import { queryKeys } from './query_keys';

vi.mock('../util/api_client', () => ({
  patch: vi.fn(),
  post: vi.fn()
}));

describe('email verification hooks', () => {
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

  it('requests another verification email', async () => {
    post.mockResolvedValue({ message: 'Verification email sent' });

    const { result } = renderHook(() => useResendEmailVerification(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(post).toHaveBeenCalledWith('/api/email_verification');
  });

  it('submits the token and updates a cached current user', async () => {
    const currentUser = {
      id: 1,
      email: 'athos@example.com',
      email_verified_at: null
    };
    queryClient.setQueryData(queryKeys.currentUser, currentUser);
    patch.mockResolvedValue({ message: 'Email address verified' });

    const { result } = renderHook(() => useVerifyEmail(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('raw-token');
    });

    expect(patch).toHaveBeenCalledWith('/api/email_verification', {
      email_verification: { token: 'raw-token' }
    });
    expect(
      queryClient.getQueryData(queryKeys.currentUser).email_verified_at
    ).toEqual(expect.any(String));
  });

  it('leaves the current-user cache empty for a logged-out visitor', async () => {
    queryClient.setQueryData(queryKeys.currentUser, null);
    patch.mockResolvedValue({ message: 'Email address verified' });

    const { result } = renderHook(() => useVerifyEmail(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('raw-token');
    });

    expect(queryClient.getQueryData(queryKeys.currentUser)).toBeNull();
  });
});
