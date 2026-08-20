import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';

import {
  createFollow,
  deleteFollow,
  fetchUser,
  fetchUserFollowers,
  fetchUserFollowing,
  fetchUsers
} from '../util/user_api_util';
import { feedCacheFromPage } from './post_hooks';
import { queryKeys } from './query_keys';

export const RELATIONSHIP_USERS_PER_PAGE = 10;
const INITIAL_RELATIONSHIP_PAGE = 1;

const relationshipUsersFromPage = page => (
  (page.user_ids || []).map(id => page.users[id])
);

const infiniteRelationshipUsersOptions = ({
  enabled = true,
  queryFn,
  queryKey
}) => ({
  enabled,
  getNextPageParam: lastPage => (
    lastPage.pagination.has_more ? lastPage.pagination.page + 1 : undefined
  ),
  initialPageParam: INITIAL_RELATIONSHIP_PAGE,
  queryFn,
  queryKey,
  select: data => ({
    ...data,
    pagination: data.pages[data.pages.length - 1]?.pagination,
    users: data.pages.flatMap(relationshipUsersFromPage)
  })
});

const updateFeedAndRefreshUserData = queryClient => firstPage => {
  queryClient.setQueryData(queryKeys.posts, feedCacheFromPage(firstPage));
  queryClient.invalidateQueries({ queryKey: queryKeys.posts });
  queryClient.invalidateQueries({ queryKey: queryKeys.users });
};

export const useUsers = () => (
  useQuery({
    queryKey: queryKeys.users,
    queryFn: fetchUsers,
    select: users => Object.values(users)
  })
);

export const useUser = id => (
  useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => fetchUser(id),
    enabled: Boolean(id)
  })
);

const useRelationshipUsers = ({ queryKey, request, userId }) => (
  useInfiniteQuery(infiniteRelationshipUsersOptions({
    enabled: Boolean(userId),
    queryKey,
    queryFn: ({ pageParam }) => request({
      id: userId,
      page: pageParam,
      perPage: RELATIONSHIP_USERS_PER_PAGE
    })
  }))
);

export const useUserFollowers = userId => (
  useRelationshipUsers({
    queryKey: queryKeys.userFollowers(userId),
    request: fetchUserFollowers,
    userId
  })
);

export const useUserFollowing = userId => (
  useRelationshipUsers({
    queryKey: queryKeys.userFollowing(userId),
    request: fetchUserFollowing,
    userId
  })
);

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: id => createFollow(id),
    onSuccess: updateFeedAndRefreshUserData(queryClient)
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: id => deleteFollow(id),
    onSuccess: updateFeedAndRefreshUserData(queryClient)
  });
};
