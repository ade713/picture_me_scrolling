import React from 'react';

import RecUserItem from './rec_user_item';
import { useFollowUser, useUsers } from '../../query/user_hooks';

const RecommendedUsers = () => {
  const followUser = useFollowUser();
  const users = useUsers();

  const handleFollowUser = id => (
    followUser.mutate(id)
  );

  const recUsers = (users.data || []).map(user =>
    <RecUserItem
      key={ user.id }
      user={ user }
      followUser={ handleFollowUser } />
  );

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
