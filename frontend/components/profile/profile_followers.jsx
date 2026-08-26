import React from 'react';

import { buttonLabels } from '../../config/button_labels';
import {
  profileMessages,
  profileViewLabels,
  profileViews
} from '../../config/user_profile';
import { useUserFollowers } from '../../query/user_hooks';
import ProfileRelationshipUsers from './profile_relationship_users';

const ProfileFollowers = ({ profileId }) => {
  const followers = useUserFollowers(profileId);

  return (
    <ProfileRelationshipUsers
      buttonLabel={buttonLabels.loadMoreFollowers}
      emptyMessage={profileMessages.noFollowers}
      heading={profileViewLabels[profileViews.followers]}
      headingId="profile-followers-heading"
      loadErrorMessage={profileMessages.followersLoadError}
      loadingButtonLabel={buttonLabels.loadingFollowers}
      loadingMessage={profileMessages.followersLoading}
      profileId={profileId}
      relationshipQuery={followers}
    />
  );
};

export default ProfileFollowers;
