import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { post } from '../util/api_client';
import { useRequestPasswordReset } from './password_reset_hooks';

vi.mock('../util/api_client', () => ({
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
});
