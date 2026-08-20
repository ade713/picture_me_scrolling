import React from 'react';
import { Link } from 'react-router-dom';

import { routes } from '../../config/routes';
import ProfileRelationshipButton from './profile_relationship_button';

const ProfileUserCard = ({
  currentUserId,
  onFollow,
  onUnfollow,
  relationshipPending = false,
  user
}) => {
  const ownCard = String(currentUserId) === String(user.id);
  const profileDestination = routes.userProfile(user.id);

  return (
    <li className="profile-user-card">
      <Link className="profile-user-avatar-link" to={profileDestination}>
        <img
          alt={`${user.username} avatar`}
          className="profile-user-avatar"
          src={user.avatar_url}
        />
      </Link>

      <Link className="profile-user-name" to={profileDestination}>
        {user.username}
      </Link>

      {!ownCard && (
        <ProfileRelationshipButton
          className="profile-user-action"
          onFollow={onFollow}
          onUnfollow={onUnfollow}
          pending={relationshipPending}
          user={user}
        />
      )}
    </li>
  );
};

export default ProfileUserCard;
