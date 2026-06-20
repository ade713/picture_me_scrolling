import React, { useCallback, useMemo } from 'react';

import RecUserItem from './rec_user_item';
import { useFollowUser, useUsers } from '../../query/user_hooks';

const EMPTY_USERS = [];

const RecommendedUsers = () => {
  const { mutate: followUser } = useFollowUser();
  const users = useUsers();
  const recommendedUsers = users.data || EMPTY_USERS;

  const handleFollowUser = useCallback(id => (
    followUser(id)
  ), [followUser]);

  const recUsers = useMemo(() => recommendedUsers.map(user =>
    <RecUserItem
      key={ user.id }
      user={ user }
      followUser={ handleFollowUser } />
  ), [handleFollowUser, recommendedUsers]);

  return (
    <div className="rec-users">
      <h2 className="rec-users-title">
        Recommended Users
      </h2>
      <ul className="rec-users-list">
        { recUsers }
      </ul>
    </div>
  );
};

export default RecommendedUsers;
