import React, { useEffect, useRef } from 'react';

import {
  useFollowUser,
  useUnfollowUser
} from '../../query/user_hooks';
import ProfileUserCard from './profile_user_card';

const EMPTY_USERS = [];

const sameUser = (firstId, secondId) => String(firstId) === String(secondId);

const ProfileRelationshipUsers = ({
  buttonLabel,
  currentUserId,
  emptyMessage,
  heading,
  headingId,
  loadErrorMessage,
  loadingButtonLabel,
  loadingMessage,
  profileId,
  relationshipQuery
}) => {
  const followUser = useFollowUser();
  const headingRef = useRef(null);
  const unfollowUser = useUnfollowUser();
  const loadedUsers = relationshipQuery.data?.users || EMPTY_USERS;

  useEffect(() => {
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView?.({ block: 'start' });
  }, [profileId]);

  const relationshipPendingFor = userId => (
    (followUser.isPending && sameUser(followUser.variables, userId)) ||
    (unfollowUser.isPending && sameUser(unfollowUser.variables, userId))
  );

  const userCards = loadedUsers.map(user => (
    <ProfileUserCard
      currentUserId={currentUserId}
      key={user.id}
      onFollow={followUser.mutate}
      onUnfollow={unfollowUser.mutate}
      relationshipPending={relationshipPendingFor(user.id)}
      user={user}
    />
  ));

  const renderRelationshipUsers = () => {
    if (relationshipQuery.isLoading) {
      return (
        <p className="profile-view-state" role="status">
          {loadingMessage}
        </p>
      );
    }

    if (relationshipQuery.isError) {
      return (
        <p className="profile-view-state" role="alert">
          {loadErrorMessage}
        </p>
      );
    }

    if (userCards.length === 0) {
      return (
        <div className="profile-view-state profile-empty-state">
          <h3>{emptyMessage}</h3>
        </div>
      );
    }

    return (
      <>
        <ul className="profile-user-list">{userCards}</ul>

        {relationshipQuery.hasNextPage && (
          <button
            className="load-more-items"
            disabled={relationshipQuery.isFetchingNextPage}
            onClick={() => relationshipQuery.fetchNextPage()}
            type="button"
          >
            {relationshipQuery.isFetchingNextPage
              ? loadingButtonLabel
              : buttonLabel}
          </button>
        )}
      </>
    );
  };

  return (
    <section aria-labelledby={headingId} className="profile-users-view">
      <h2
        className="visually-hidden"
        id={headingId}
        ref={headingRef}
        tabIndex="-1"
      >
        {heading}
      </h2>
      {renderRelationshipUsers()}
    </section>
  );
};

export default ProfileRelationshipUsers;
