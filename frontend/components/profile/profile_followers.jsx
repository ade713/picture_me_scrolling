import React from 'react';

import { buttonLabels } from '../../config/button_labels';
import {
  profileMessages,
  profileViewLabels,
  profileViews
} from '../../config/user_profile';
import { useUserFollowers } from '../../query/user_hooks';
import ProfileRelationshipUsers from './profile_relationship_users';

const ProfileFollowers = ({ profileId, shouldFocusHeading = true }) => {
  const followers = useUserFollowers(profileId);

  return (
    <ProfileRelationshipUsers
      emptyMessage={profileMessages.noFollowers}
      fallbackLabel={buttonLabels.loadMoreFollowers}
      heading={profileViewLabels[profileViews.followers]}
      headingId="profile-followers-heading"
      initialLoadingLabel={profileMessages.followersLoading}
      loadErrorMessage={profileMessages.followersLoadError}
      nextPageLoadingLabel={buttonLabels.loadingMoreFollowers}
      profileId={profileId}
      relationshipQuery={followers}
      retryLabel={buttonLabels.retryLoading}
      shouldFocusHeading={shouldFocusHeading}
    />
  );
};

export default ProfileFollowers;
