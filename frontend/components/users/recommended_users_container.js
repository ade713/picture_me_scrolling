import React from 'react';

import RecommendedUsers from './recommended_users';
import { useFollowUser, useUsers } from '../../query/user_hooks';

const RecommendedUsersContainer = props => {
  const followUser = useFollowUser();
  const users = useUsers();

  const handleFollowUser = id => (
    followUser.mutate(id)
  );

  return (
    <RecommendedUsers
      {...props}
      followUser={ handleFollowUser }
      users={ users.data || [] }
    />
  );
};

export default RecommendedUsersContainer;
