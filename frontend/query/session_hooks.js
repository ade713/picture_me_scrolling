import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
    mutationFn: user => post('/api/session', { user }),
    onSuccess: currentUser => {
      queryClient.setQueryData(queryKeys.currentUser, currentUser);
    }
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: user => post('/api/users', { user }),
    onSuccess: currentUser => {
      queryClient.setQueryData(queryKeys.currentUser, currentUser);
    }
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => destroy('/api/session'),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.currentUser, null);
    }
  });
};
