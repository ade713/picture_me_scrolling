import React from 'react';
import { useDispatch } from 'react-redux';

import RecommendedUsers from './recommended_users';
import { receiveAllPosts } from '../../actions/posts_actions';
import { useFollowUser, useUsers } from '../../query/user_hooks';

const RecommendedUsersContainer = props => {
  const dispatch = useDispatch();
  const followUser = useFollowUser();
  const users = useUsers();

  const handleFollowUser = id => (
    followUser.mutate(id, {
      onSuccess: posts => dispatch(receiveAllPosts(posts))
    })
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
