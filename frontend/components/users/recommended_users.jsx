import React from 'react';

import RecUserItem from './rec_user_item';


const RecommendedUsers = ({ followUser, users }) => {
  const recUsers = users.map(user =>
    <RecUserItem
      key={ user.id }
      user={ user }
      followUser={ followUser } />
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
