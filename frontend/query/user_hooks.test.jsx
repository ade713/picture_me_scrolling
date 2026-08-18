import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  createFollow,
  deleteFollow,
  fetchUser
} from '../util/user_api_util';
import { queryKeys } from './query_keys';
import { useFollowUser, useUnfollowUser, useUser } from './user_hooks';

vi.mock('../util/user_api_util', () => ({
  createFollow: vi.fn(),
  deleteFollow: vi.fn(),
  fetchUser: vi.fn(),
  fetchUsers: vi.fn()
}));

describe('user hooks', () => {
  let queryClient;
  let wrapper;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
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

  it('fetches and caches profile identity by user ID', async () => {
    const profile = {
      id: 42,
      username: 'Athos',
      avatar_url: '/avatars/athos.png'
    };
    fetchUser.mockResolvedValue(profile);

    const { result } = renderHook(() => useUser('42'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchUser).toHaveBeenCalledWith('42');
    expect(queryClient.getQueryData(queryKeys.user(42))).toEqual(profile);
    expect(queryKeys.user(42)).toEqual(['users', 'detail', '42']);
  });

  it('updates the base feed and refreshes post and user queries after following', async () => {
    const firstPage = {
      pagination: { page: 1, total_count: 1 },
      post_ids: [10],
      posts: { 10: { id: 10 } }
    };
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    createFollow.mockResolvedValue(firstPage);
    const { result } = renderHook(() => useFollowUser(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(42);
    });

    expect(createFollow).toHaveBeenCalledWith(42);
    expect(queryClient.getQueryData(queryKeys.posts)).toEqual({
      pageParams: [1],
      pages: [firstPage]
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.posts });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.users });
  });

  it('refreshes post and user queries after unfollowing', async () => {
    const firstPage = {
      pagination: { page: 1, total_count: 0 },
      post_ids: [],
      posts: {}
    };
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    deleteFollow.mockResolvedValue(firstPage);
    const { result } = renderHook(() => useUnfollowUser(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(42);
    });

    expect(deleteFollow).toHaveBeenCalledWith(42);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.posts });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.users });
  });
});
