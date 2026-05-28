import React from 'react';
import { useDispatch } from 'react-redux';

import RecommendedUsers from './recommended_users';
import { followUser } from '../../actions/users_actions';
import { useUsers } from '../../query/user_hooks';

const RecommendedUsersContainer = props => {
  const dispatch = useDispatch();
  const users = useUsers();

  const handleFollowUser = id => (
    dispatch(followUser(id))
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
