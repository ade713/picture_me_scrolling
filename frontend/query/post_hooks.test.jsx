import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { patch } from '../util/api_client';
import { useUpdatePost } from './post_hooks';
import { queryKeys } from './query_keys';

vi.mock('../util/api_client', () => ({
  destroy: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn()
}));

describe('post hooks', () => {
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

  it('updates cached post tags with the API response', async () => {
    const originalPost = {
      id: 10,
      title: 'Original title',
      tags: ['photography']
    };
    const updatedPost = {
      ...originalPost,
      tags: ['sunset', 'travel']
    };
    const postAttributes = {
      title: originalPost.title,
      tags: updatedPost.tags
    };
    const feed = {
      pageParams: [1],
      pages: [{
        pagination: { page: 1, total_count: 1 },
        post_ids: [originalPost.id],
        posts: { [originalPost.id]: originalPost }
      }]
    };
    queryClient.setQueryData(queryKeys.posts, feed);
    queryClient.setQueryData(queryKeys.post(originalPost.id), originalPost);
    patch.mockResolvedValue(updatedPost);

    const { result } = renderHook(() => useUpdatePost(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        id: originalPost.id,
        post: postAttributes
      });
    });

    expect(patch).toHaveBeenCalledWith('/api/posts/10', {
      post: postAttributes
    });
    expect(
      queryClient.getQueryData(queryKeys.posts).pages[0].posts[originalPost.id]
    ).toEqual(updatedPost);
    expect(queryClient.getQueryData(queryKeys.post(originalPost.id)))
      .toEqual(updatedPost);
  });
});
