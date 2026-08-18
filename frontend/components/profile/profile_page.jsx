import React, { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { APP_NAME, BACK_TO_DASHBOARD_LABEL } from '../../config/app';
import {
  profileMessages,
  profileViewFromParam,
  profileViews
} from '../../config/user_profile';
import { routes } from '../../config/routes';
import { useCurrentUser } from '../../query/session_hooks';
import { useFollowUser, useUnfollowUser, useUser } from '../../query/user_hooks';
import AccountMenu from '../dashboard/account_menu';
import ProfileHeader from './profile_header';
import ProfileNavigation from './profile_navigation';
import ProfilePosts from './profile_posts';

const ProfilePage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get('view');
  const activeView = profileViewFromParam(requestedView);
  const currentUser = useCurrentUser().data;
  const followUser = useFollowUser();
  const profileQuery = useUser(id);
  const unfollowUser = useUnfollowUser();

  useEffect(() => {
    const normalizedParams = new URLSearchParams(searchParams);

    if (activeView === profileViews.posts) {
      normalizedParams.delete('view');
    } else {
      normalizedParams.delete('tag');
    }

    if (normalizedParams.toString() !== searchParams.toString()) {
      setSearchParams(normalizedParams, { replace: true });
    }
  }, [activeView, searchParams, setSearchParams]);

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
          onFollow={() => followUser.mutate(profileQuery.data.id)}
          onUnfollow={() => unfollowUser.mutate(profileQuery.data.id)}
          profile={profileQuery.data}
          relationshipPending={followUser.isPending || unfollowUser.isPending}
        />
        <ProfileNavigation activeView={activeView} profileId={profileQuery.data.id} />
        {activeView === profileViews.posts && (
          <ProfilePosts profileId={profileQuery.data.id} />
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
