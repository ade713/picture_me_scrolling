import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { values } from 'lodash';

import { destroy, get, post } from '../util/api_client';
import { queryKeys } from './query_keys';

const addPostToCache = (posts, newPost) => ({
  ...(posts || {}),
  [newPost.id]: newPost
});

const updatePostInCache = (posts, updatedPost) => ({
  ...(posts || {}),
  [updatedPost.id]: updatedPost
});

const removePostFromCache = (posts, deletedPost) => {
  const nextPosts = { ...(posts || {}) };
  delete nextPosts[deletedPost.id];
  return nextPosts;
};

export const usePosts = () => (
  useQuery({
    queryKey: queryKeys.posts,
    queryFn: () => get('/api/posts'),
    select: posts => values(posts)
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
