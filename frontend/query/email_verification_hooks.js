import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiEndpoints } from '../config/api_endpoints';
import { patch, post } from '../util/api_client';
import { queryKeys } from './query_keys';

export const useResendEmailVerification = () => (
  useMutation({
    mutationFn: () => post(apiEndpoints.emailVerification)
  })
);

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: token => patch(apiEndpoints.emailVerification, {
      email_verification: { token }
    }),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.currentUser, currentUser => (
        currentUser
          ? { ...currentUser, email_verified_at: new Date().toISOString() }
          : currentUser
      ));
    }
  });
};
