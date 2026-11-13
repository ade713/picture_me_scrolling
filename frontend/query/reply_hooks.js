import { useInfiniteQuery } from '@tanstack/react-query';
import { apiEndpoints } from '../config/api_endpoints';
import { get } from '../util/api_client';
import { queryKeys } from './query_keys';

export const REPLIES_PER_PAGE = 5;

export const useCommentReplies = (postId, commentId) => useInfiniteQuery({
  queryKey: queryKeys.commentReplies(postId, commentId),
  enabled: Boolean(postId && commentId),
  initialPageParam: null,
  queryFn: ({ pageParam, signal }) => get(apiEndpoints.comments.repliesPage({
    commentId, after: pageParam, perPage: REPLIES_PER_PAGE
  }), { signal }),
  getNextPageParam: page => page.pagination.has_more ? page.pagination.next_cursor : undefined,
  select: data => ({
    ...data,
    replies: data.pages.flatMap(page => page.comment_ids.map(id => page.comments[id]))
  })
});
