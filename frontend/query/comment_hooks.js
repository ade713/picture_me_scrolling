import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiEndpoints } from "../config/api_endpoints";
import { destroy, get, patch, post } from "../util/api_client";
import { queryKeys } from "./query_keys";

export const COMMENTS_PER_PAGE = 10;
const INITIAL_COMMENTS_CURSOR = null;

export const usePostComments = (postId) =>
  useInfiniteQuery({
    enabled: Boolean(postId),
    queryKey: queryKeys.postComments(postId),
    initialPageParam: INITIAL_COMMENTS_CURSOR,
    queryFn: ({ pageParam, signal }) =>
      get(
        apiEndpoints.comments.page({
          postId,
          after: pageParam,
          perPage: COMMENTS_PER_PAGE,
        }),
        { signal },
      ),
    getNextPageParam: (lastPage) => (lastPage.pagination.has_more ? lastPage.pagination.next_cursor : undefined),
    select: (data) => ({
      ...data,
      comments: data.pages.flatMap((page) => page.comment_ids.map((id) => page.comments[id])),
      pagination: data.pages[data.pages.length - 1]?.pagination,
    }),
  });

const refreshCommentConsumers = (queryClient, postId) => {
  const postKey = queryKeys.post(postId);

  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.postComments(postId) }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.posts,
      predicate: (query) => {
        const matchesPost =
          query.queryKey.length === postKey.length && query.queryKey.every((part, index) => part === postKey[index]);
        return matchesPost || query.state.data?.pages?.some((page) => Boolean(page.posts?.[postId])) || false;
      },
    }),
  ]);
};

export const useCreateComment = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) => post(apiEndpoints.comments.collection(postId), { comment: { body } }),
    // Leave cursor pages intact: the returned comment may be beyond unloaded
    // comments. The form can display mutation.data separately until it is loaded.
    onSuccess: () => refreshCommentConsumers(queryClient, postId),
  });
};

export const useUpdateComment = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }) => patch(apiEndpoints.comments.detail(id), { comment: { body } }),
    onSuccess: () => refreshCommentConsumers(queryClient, postId),
  });
};

export const useDeleteComment = (postId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => destroy(apiEndpoints.comments.detail(id)),
    // A 204 can mean a removed row or a placeholder; refetch authoritative state.
    onSuccess: () => refreshCommentConsumers(queryClient, postId),
  });
};
