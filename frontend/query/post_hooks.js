import { useQuery } from '@tanstack/react-query';
import { values } from 'lodash';

import { get } from '../util/api_client';
import { queryKeys } from './query_keys';

export const usePosts = () => (
  useQuery({
    queryKey: queryKeys.posts,
    queryFn: () => get('/api/posts'),
    select: posts => values(posts)
  })
);
