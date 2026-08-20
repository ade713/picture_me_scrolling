import React, { useEffect, useRef } from 'react';

import { buttonLabels } from '../../config/button_labels';
import {
  profileMessages,
  profileViewLabels,
  profileViews
} from '../../config/user_profile';
import {
  useFollowUser,
  useUnfollowUser,
  useUserFollowers
} from '../../query/user_hooks';
import ProfileUserCard from './profile_user_card';

const EMPTY_USERS = [];

const sameUser = (firstId, secondId) => String(firstId) === String(secondId);

const ProfileFollowers = ({ currentUserId, profileId }) => {
  const followers = useUserFollowers(profileId);
  const followUser = useFollowUser();
  const headingRef = useRef(null);
  const unfollowUser = useUnfollowUser();
  const loadedFollowers = followers.data?.users || EMPTY_USERS;

  useEffect(() => {
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView?.({ block: 'start' });
  }, [profileId]);

  const relationshipPendingFor = userId => (
    (followUser.isPending && sameUser(followUser.variables, userId)) ||
    (unfollowUser.isPending && sameUser(unfollowUser.variables, userId))
  );

  const followerCards = loadedFollowers.map(user => (
    <ProfileUserCard
      currentUserId={currentUserId}
      key={user.id}
      onFollow={followUser.mutate}
      onUnfollow={unfollowUser.mutate}
      relationshipPending={relationshipPendingFor(user.id)}
      user={user}
    />
  ));

  const renderFollowers = () => {
    if (followers.isLoading) {
      return (
        <p className="profile-view-state" role="status">
          {profileMessages.followersLoading}
        </p>
      );
    }

    if (followers.isError) {
      return (
        <p className="profile-view-state" role="alert">
          {profileMessages.followersLoadError}
        </p>
      );
    }

    if (followerCards.length === 0) {
      return (
        <div className="profile-view-state profile-empty-state">
          <h3>{profileMessages.noFollowers}</h3>
        </div>
      );
    }

    return (
      <>
        <ul className="profile-user-list">{followerCards}</ul>

        {followers.hasNextPage && (
          <button
            className="load-more-items"
            disabled={followers.isFetchingNextPage}
            onClick={() => followers.fetchNextPage()}
            type="button"
          >
            {followers.isFetchingNextPage
              ? buttonLabels.loadingFollowers
              : buttonLabels.loadMoreFollowers}
          </button>
        )}
      </>
    );
  };

  return (
    <section aria-labelledby="profile-followers-heading" className="profile-users-view">
      <h2
        className="visually-hidden"
        id="profile-followers-heading"
        ref={headingRef}
        tabIndex="-1"
      >
        {profileViewLabels[profileViews.followers]}
      </h2>
      {renderFollowers()}
    </section>
  );
};

export default ProfileFollowers;
