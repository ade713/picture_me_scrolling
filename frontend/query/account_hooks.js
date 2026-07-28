import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiEndpoints } from '../config/api_endpoints';
import { patch } from '../util/api_client';
import { queryKeys } from './query_keys';

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: avatar => {
      const formData = new FormData();
      formData.append('avatar', avatar);

      return patch(apiEndpoints.account.avatar, formData);
    },
    onSuccess: currentUser => {
      queryClient.setQueryData(queryKeys.currentUser, currentUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    }
  });
};

export const useUpdateEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: email => patch(apiEndpoints.account.email, {
      account: { email }
    }),
    onSuccess: currentUser => {
      queryClient.setQueryData(queryKeys.currentUser, currentUser);
    }
  });
};

export const useUpdatePassword = () => (
  useMutation({
    mutationFn: account => patch(apiEndpoints.account.password, { account })
  })
);
