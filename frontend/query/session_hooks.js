import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiEndpoints } from '../config/api_endpoints';
import { destroy, post } from '../util/api_client';
import { queryKeys } from './query_keys';

const currentUserQueryOptions = {
  queryKey: queryKeys.currentUser,
  queryFn: () => null,
  enabled: false,
  staleTime: Infinity,
  gcTime: Infinity,
  initialData: null
};

export const useCurrentUser = () => (
  useQuery(currentUserQueryOptions)
);

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: user => post(apiEndpoints.session, { user }),
    onSuccess: currentUser => {
      queryClient.setQueryData(queryKeys.currentUser, currentUser);
    }
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: user => post(apiEndpoints.users.collection, { user }),
    onSuccess: currentUser => {
      queryClient.setQueryData(queryKeys.currentUser, currentUser);
    }
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => destroy(apiEndpoints.session),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.currentUser, null);
    }
  });
};
