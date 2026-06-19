import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { destroy, get, post } from '../util/api_client';
import { queryKeys } from './query_keys';

export const POSTS_PER_PAGE = 10;

export const feedCacheFromPage = page => ({
  pageParams: [page.pagination?.page || 1],
  pages: [page]
});

const postsFromPage = page => (
  (page.post_ids || []).map(id => page.posts[id])
);

const updatePagePosts = (page, updater) => ({
  ...page,
  posts: updater(page.posts || {})
});

const addPostToCache = (feed, newPost) => {
  if (!feed?.pages?.length) return feed;

  return {
    ...feed,
    pages: feed.pages.map((page, index) => {
      if (index !== 0) return page;

      return {
        ...updatePagePosts(page, posts => ({
          [newPost.id]: newPost,
          ...posts
        })),
        post_ids: [newPost.id, ...(page.post_ids || [])],
        pagination: {
          ...page.pagination,
          total_count: page.pagination.total_count + 1
        }
      };
    })
  };
};

const updatePostInCache = (feed, updatedPost) => {
  if (!feed?.pages?.length) return feed;

  return {
    ...feed,
    pages: feed.pages.map(page => (
      updatePagePosts(page, posts => (
        posts[updatedPost.id] ? { ...posts, [updatedPost.id]: updatedPost } : posts
      ))
    ))
  };
};

const removePostFromCache = (feed, deletedPost) => {
  if (!feed?.pages?.length) return feed;

  return {
    ...feed,
    pages: feed.pages.map(page => {
      if (!page.posts?.[deletedPost.id]) return page;

      return {
        ...updatePagePosts(page, posts => {
          const nextPosts = { ...posts };
          delete nextPosts[deletedPost.id];
          return nextPosts;
        }),
        post_ids: (page.post_ids || []).filter(id => id !== deletedPost.id),
        pagination: {
          ...page.pagination,
          total_count: page.pagination.total_count - 1
        }
      };
    })
  };
};

export const usePosts = () => (
  useInfiniteQuery({
    queryKey: queryKeys.posts,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => get(
      `/api/posts?page=${pageParam}&per_page=${POSTS_PER_PAGE}`
    ),
    getNextPageParam: lastPage => (
      lastPage.pagination.has_more ? lastPage.pagination.page + 1 : undefined
    ),
    select: data => ({
      ...data,
      pagination: data.pages[data.pages.length - 1]?.pagination,
      posts: data.pages.flatMap(postsFromPage)
    })
  })
);

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newPost => post('/api/posts', { post: newPost }),
    onSuccess: newPost => {
      queryClient.setQueryData(queryKeys.posts, posts => (
        addPostToCache(posts, newPost)
      ));
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    }
  });
};

export const useCreateMediaPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formData => post('/api/posts', formData),
    onSuccess: newPost => {
      queryClient.setQueryData(queryKeys.posts, posts => (
        addPostToCache(posts, newPost)
      ));
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    }
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletedPost => destroy(`/api/posts/${deletedPost.id}`),
    onSuccess: deletedPost => {
      queryClient.setQueryData(queryKeys.posts, posts => (
        removePostFromCache(posts, deletedPost)
      ));
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    }
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: id => post(`/api/posts/${id}/like`),
    onSuccess: updatedPost => {
      queryClient.setQueryData(queryKeys.posts, posts => (
        updatePostInCache(posts, updatedPost)
      ));
      queryClient.setQueryData(queryKeys.post(updatedPost.id), updatedPost);
    }
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: id => destroy(`/api/posts/${id}/like`),
    onSuccess: updatedPost => {
      queryClient.setQueryData(queryKeys.posts, posts => (
        updatePostInCache(posts, updatedPost)
      ));
      queryClient.setQueryData(queryKeys.post(updatedPost.id), updatedPost);
    }
  });
};
