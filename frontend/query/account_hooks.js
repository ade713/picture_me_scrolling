import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patch } from '../util/api_client';
import { queryKeys } from './query_keys';

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: avatar => {
      const formData = new FormData();
      formData.append('avatar', avatar);

      return patch('/api/account/avatar', formData);
    },
    onSuccess: currentUser => {
      queryClient.setQueryData(queryKeys.currentUser, currentUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    }
  });
};

export const useUpdatePassword = () => (
  useMutation({
    mutationFn: account => patch('/api/account/password', { account })
  })
);
