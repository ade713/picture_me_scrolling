import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { values } from 'lodash';

import { createFollow, deleteFollow, fetchUser, fetchUsers } from '../util/user_api_util';
import { queryKeys } from './query_keys';

const updatePostsAndRefreshUsers = queryClient => posts => {
  queryClient.setQueryData(queryKeys.posts, posts);
  queryClient.invalidateQueries({ queryKey: queryKeys.users });
};

export const useUsers = () => (
  useQuery({
    queryKey: queryKeys.users,
    queryFn: fetchUsers,
    select: users => values(users)
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
    onSuccess: updatePostsAndRefreshUsers(queryClient)
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: id => deleteFollow(id),
    onSuccess: updatePostsAndRefreshUsers(queryClient)
  });
};
