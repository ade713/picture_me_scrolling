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
      emptyMessage={profileMessages.noFollowing}
      fallbackLabel={buttonLabels.loadMoreFollowing}
      heading={profileViewLabels[profileViews.following]}
      headingId="profile-following-heading"
      initialLoadingLabel={profileMessages.followingLoading}
      loadErrorMessage={profileMessages.followingLoadError}
      nextPageLoadingLabel={buttonLabels.loadingMoreFollowing}
      profileId={profileId}
      relationshipQuery={following}
      retryLabel={buttonLabels.retryLoading}
    />
  );
};

export default ProfileFollowing;
