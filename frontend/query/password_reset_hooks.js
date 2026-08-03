import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiEndpoints } from '../config/api_endpoints';
import { patch, post } from '../util/api_client';
import { queryKeys } from './query_keys';

export const useRequestPasswordReset = () => (
  useMutation({
    mutationFn: email => post(apiEndpoints.passwordReset, {
      password_reset: { email }
    })
  })
);

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: passwordReset => patch(apiEndpoints.passwordReset, {
      password_reset: passwordReset
    }),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.currentUser, null);
    }
  });
};
