import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { fetchUser } from '../util/user_api_util';
import { queryKeys } from './query_keys';
import { useUser } from './user_hooks';

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
});
