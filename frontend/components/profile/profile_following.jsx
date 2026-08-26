import React from 'react';

import { buttonLabels } from '../../config/button_labels';
import {
  profileMessages,
  profileViewLabels,
  profileViews
} from '../../config/user_profile';
import { useUserFollowing } from '../../query/user_hooks';
import ProfileRelationshipUsers from './profile_relationship_users';

const ProfileFollowing = ({ profileId }) => {
  const following = useUserFollowing(profileId);

  return (
    <ProfileRelationshipUsers
      buttonLabel={buttonLabels.loadMoreFollowing}
      emptyMessage={profileMessages.noFollowing}
      heading={profileViewLabels[profileViews.following]}
      headingId="profile-following-heading"
      loadErrorMessage={profileMessages.followingLoadError}
      loadingButtonLabel={buttonLabels.loadingFollowing}
      loadingMessage={profileMessages.followingLoading}
      profileId={profileId}
      relationshipQuery={following}
    />
  );
};

export default ProfileFollowing;
