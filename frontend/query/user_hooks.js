import { useQuery } from '@tanstack/react-query';
import { values } from 'lodash';

import { fetchUser, fetchUsers } from '../util/user_api_util';
import { queryKeys } from './query_keys';

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
