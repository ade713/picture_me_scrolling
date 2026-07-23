import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { patch } from '../util/api_client';
import { useUpdateAvatar, useUpdatePassword } from './account_hooks';
import { queryKeys } from './query_keys';

vi.mock('../util/api_client', () => ({
  patch: vi.fn()
}));

describe('account hooks', () => {
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
      <QueryClientProvider client={ queryClient }>
        { children }
      </QueryClientProvider>
    );
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('uploads an avatar as FormData and refreshes avatar-dependent caches', async () => {
    const avatar = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const updatedUser = {
      id: 1,
      username: 'Athos',
      avatar_url: '/avatars/new.png'
    };
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    patch.mockResolvedValue(updatedUser);

    const { result } = renderHook(() => useUpdateAvatar(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(avatar);
    });

    expect(patch).toHaveBeenCalledWith(
      '/api/account/avatar',
      expect.any(FormData)
    );
    expect(patch.mock.calls[0][1].get('avatar')).toBe(avatar);
    expect(queryClient.getQueryData(queryKeys.currentUser)).toEqual(updatedUser);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.posts });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.users });
  });

  it('submits password fields without changing the current-user cache', async () => {
    const account = {
      current_password: 'old-password',
      password: 'new-password',
      password_confirmation: 'new-password'
    };
    const currentUser = { id: 1, username: 'Athos' };
    queryClient.setQueryData(queryKeys.currentUser, currentUser);
    patch.mockResolvedValue(currentUser);

    const { result } = renderHook(() => useUpdatePassword(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(account);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patch).toHaveBeenCalledWith('/api/account/password', { account });
    expect(queryClient.getQueryData(queryKeys.currentUser)).toBe(currentUser);
  });
});
