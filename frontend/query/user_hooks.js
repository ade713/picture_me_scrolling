import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createFollow, deleteFollow, fetchUser, fetchUsers } from '../util/user_api_util';
import { feedCacheFromPage } from './post_hooks';
import { queryKeys } from './query_keys';

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
