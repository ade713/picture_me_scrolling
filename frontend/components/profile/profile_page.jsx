import React from 'react';
import { useParams } from 'react-router-dom';

import { HTTP_NOT_FOUND } from '../../config/http_status';
import {
  profileMessages,
  profileViews
} from '../../config/user_profile';
import { useCurrentUser } from '../../query/session_hooks';
import { useFollowUser, useUnfollowUser, useUser } from '../../query/user_hooks';
import { useScrollRestoration } from '../../util/scroll_restoration';
import PageLayout from '../layout/page_layout';
import LoadingIndicator, {
  loadingIndicatorVariants
} from '../loading/loading_indicator';
import ProfileFollowers from './profile_followers';
import ProfileFollowing from './profile_following';
import ProfileHeader from './profile_header';
import ProfileNavigation from './profile_navigation';
import ProfilePosts from './profile_posts';
import useProfileNavigation from './use_profile_navigation';

const ProfilePage = () => {
  const { id } = useParams();
  const { activeTag, activeView } = useProfileNavigation();
  const currentUser = useCurrentUser().data;
  const followUser = useFollowUser();
  const profileQuery = useUser(id);
  const shouldFocusNavigationTarget = useScrollRestoration({
    restoreByRoute: true
  });
  const unfollowUser = useUnfollowUser();

  const renderProfileState = () => {
    if (profileQuery.isPending) {
      return (
        <LoadingIndicator
          label={profileMessages.loading}
          variant={loadingIndicatorVariants.large}
        />
      );
    }

    if (profileQuery.isError) {
      const message = profileQuery.error?.status === HTTP_NOT_FOUND
        ? profileMessages.notFound
        : profileMessages.loadError;

      return (
        <div className="profile-state" role="alert">
          <h1>{message}</h1>
        </div>
      );
    }

    return (
      <>
        <ProfileHeader
          currentUserId={currentUser.id}
          onFollow={followUser.mutate}
          onUnfollow={unfollowUser.mutate}
          profile={profileQuery.data}
          relationshipPending={followUser.isPending || unfollowUser.isPending}
        />
        <ProfileNavigation activeView={activeView} profileId={profileQuery.data.id} />
        {activeView === profileViews.posts && (
          <ProfilePosts
            profileId={profileQuery.data.id}
            shouldFocusHeading={shouldFocusNavigationTarget}
            tag={activeTag}
          />
        )}
        {activeView === profileViews.followers && (
          <ProfileFollowers
            profileId={profileQuery.data.id}
            shouldFocusHeading={shouldFocusNavigationTarget}
          />
        )}
        {activeView === profileViews.following && (
          <ProfileFollowing
            profileId={profileQuery.data.id}
            shouldFocusHeading={shouldFocusNavigationTarget}
          />
        )}
      </>
    );
  };

  return (
    <PageLayout className="profile-page">
      {renderProfileState()}
    </PageLayout>
  );
};

export default ProfilePage;
