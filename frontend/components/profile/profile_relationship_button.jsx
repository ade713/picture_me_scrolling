import React from 'react';

import { buttonActionLabels, buttonLabels } from '../../config/button_labels';

const ProfileRelationshipButton = ({
  className,
  onFollow,
  onUnfollow,
  pending = false,
  user
}) => {
  const followedByCurrentUser = user.followed_by_current_user;
  const actionLabel = followedByCurrentUser
    ? buttonLabels.unfollow
    : buttonLabels.follow;
  const actionDescription = followedByCurrentUser
    ? buttonActionLabels.unfollowUser(user.username)
    : buttonActionLabels.followUser(user.username);
  const handleRelationshipAction = () => {
    const action = followedByCurrentUser ? onUnfollow : onFollow;

    action(user.id);
  };

  return (
    <button
      aria-label={actionDescription}
      className={`profile-relationship-action ${className}`}
      disabled={pending}
      onClick={handleRelationshipAction}
      title={actionDescription}
      type="button"
    >
      {actionLabel}
    </button>
  );
};

export default ProfileRelationshipButton;
