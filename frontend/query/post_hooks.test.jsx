import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { get, patch, post } from '../util/api_client';
import { useLikePost, usePosts, useUpdatePost, useUserPosts } from './post_hooks';
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

  it('requests the unfiltered first page without a tag parameter', async () => {
    get.mockResolvedValue({
      pagination: { has_more: false, page: 1 },
      post_ids: [],
      posts: {}
    });

    const { result } = renderHook(() => usePosts(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(get).toHaveBeenCalledWith('/api/posts?page=1&per_page=10');
  });

  it('uses separate paginated caches when the active tag changes', async () => {
    get.mockImplementation(async endpoint => {
      const params = new URL(endpoint, 'http://localhost').searchParams;
      const page = Number(params.get('page'));
      const tag = params.get('tag');

      return {
        pagination: {
          has_more: tag === 'photography' && page === 1,
          page
        },
        post_ids: [],
        posts: {}
      };
    });

    const { result, rerender } = renderHook(
      ({ tag }) => usePosts(tag),
      { initialProps: { tag: 'photography' }, wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await result.current.fetchNextPage();

    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api/posts?page=1&per_page=10&tag=photography'
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api/posts?page=2&per_page=10&tag=photography'
    );

    rerender({ tag: 'sunset' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(get).toHaveBeenNthCalledWith(
      3,
      '/api/posts?page=1&per_page=10&tag=sunset'
    );
    expect(queryClient.getQueryData(queryKeys.postsFeed('photography')).pages)
      .toHaveLength(2);
    expect(queryClient.getQueryData(queryKeys.postsFeed('sunset')).pages)
      .toHaveLength(1);
  });

  it('requests and paginates posts for one profile', async () => {
    get.mockImplementation(async endpoint => {
      const params = new URL(endpoint, 'http://localhost').searchParams;
      const page = Number(params.get('page'));

      return {
        pagination: { has_more: page === 1, page },
        post_ids: [page],
        posts: { [page]: { id: page, title: `Post ${page}` } }
      };
    });

    const { result } = renderHook(() => useUserPosts(42), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api/users/42/posts?page=1&per_page=10'
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api/users/42/posts?page=2&per_page=10'
    );
    const cachedProfilePosts = queryClient.getQueryData(queryKeys.userPosts(42));
    expect(cachedProfilePosts.pages).toHaveLength(2);
    expect(cachedProfilePosts.pages[1].posts[2]).toEqual({
      id: 2,
      title: 'Post 2'
    });
  });

  it('updates a liked post in dashboard and profile post collections', async () => {
    const originalPost = { id: 10, liked: false };
    const updatedPost = { id: 10, liked: true };
    const page = {
      pagination: { has_more: false, page: 1 },
      post_ids: [originalPost.id],
      posts: { [originalPost.id]: originalPost }
    };
    const feed = { pageParams: [1], pages: [page] };
    queryClient.setQueryData(queryKeys.posts, feed);
    queryClient.setQueryData(queryKeys.userPosts(42), feed);
    post.mockResolvedValue(updatedPost);

    const { result } = renderHook(() => useLikePost(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(originalPost.id);
    });

    expect(
      queryClient.getQueryData(queryKeys.posts).pages[0].posts[originalPost.id]
    ).toEqual(updatedPost);
    expect(
      queryClient.getQueryData(queryKeys.userPosts(42)).pages[0].posts[originalPost.id]
    ).toEqual(updatedPost);
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
