import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { APP_NAME, BACK_TO_DASHBOARD_LABEL } from '../../config/app';
import {
  profileMessages,
  profileViews
} from '../../config/user_profile';
import { routes } from '../../config/routes';
import { useCurrentUser } from '../../query/session_hooks';
import { useFollowUser, useUnfollowUser, useUser } from '../../query/user_hooks';
import AccountMenu from '../dashboard/account_menu';
import ProfileFollowers from './profile_followers';
import ProfileFollowing from './profile_following';
import ProfileHeader from './profile_header';
import ProfileNavigation from './profile_navigation';
import ProfilePosts from './profile_posts';
import useProfileNavigation from './use_profile_navigation';
import useProfileScrollRestoration from './use_profile_scroll_restoration';

const ProfilePage = () => {
  const { id } = useParams();
  const { activeTag, activeView } = useProfileNavigation();
  const currentUser = useCurrentUser().data;
  const followUser = useFollowUser();
  const profileQuery = useUser(id);
  const shouldFocusNavigationTarget = useProfileScrollRestoration();
  const unfollowUser = useUnfollowUser();

  const renderProfileState = () => {
    if (profileQuery.isPending) {
      return <p className="profile-state" role="status">{profileMessages.loading}</p>;
    }

    if (profileQuery.isError) {
      const message = profileQuery.error?.status === 404
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
    <div className="profile-page">
      <header className="profile-nav">
        <Link className="profile-brand" to={routes.dashboard}>{APP_NAME}</Link>
        <AccountMenu />
      </header>

      <main className="profile-main">
        <Link className="profile-back-link" to={routes.dashboard}>
          <span aria-hidden="true">←</span>
          {BACK_TO_DASHBOARD_LABEL}
        </Link>

        {renderProfileState()}
      </main>
    </div>
  );
};

export default ProfilePage;
