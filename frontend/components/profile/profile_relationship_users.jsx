import React, { useEffect, useRef } from 'react';

import { useCurrentUser } from '../../query/session_hooks';
import {
  useFollowUser,
  useUnfollowUser
} from '../../query/user_hooks';
import AutomaticPagination from '../pagination/automatic_pagination';
import LoadingIndicator, {
  loadingIndicatorVariants
} from '../loading/loading_indicator';
import ProfileUserCard from './profile_user_card';

const EMPTY_USERS = [];

const sameUser = (firstId, secondId) => String(firstId) === String(secondId);

const ProfileRelationshipUsers = ({
  emptyMessage,
  fallbackLabel,
  heading,
  headingId,
  initialLoadingLabel,
  loadErrorMessage,
  nextPageLoadingLabel,
  profileId,
  relationshipQuery,
  retryLabel,
  shouldFocusHeading = true
}) => {
  const currentUserId = useCurrentUser().data?.id;
  const followUser = useFollowUser();
  const headingRef = useRef(null);
  const unfollowUser = useUnfollowUser();
  const loadedUsers = relationshipQuery.data?.users || EMPTY_USERS;

  useEffect(() => {
    if (!shouldFocusHeading) return;

    headingRef.current?.focus();
    headingRef.current?.scrollIntoView?.({ block: 'start' });
  }, [profileId, shouldFocusHeading]);

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
        <LoadingIndicator
          label={initialLoadingLabel}
          variant={loadingIndicatorVariants.large}
        />
      );
    }

    if (
      relationshipQuery.isError &&
      !relationshipQuery.isFetchNextPageError
    ) {
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

        <AutomaticPagination
          fallbackClassName="load-more-items"
          fallbackLabel={fallbackLabel}
          hasNextPage={relationshipQuery.hasNextPage}
          isFetchingNextPage={relationshipQuery.isFetchingNextPage}
          isNextPageError={relationshipQuery.isFetchNextPageError}
          loadingLabel={nextPageLoadingLabel}
          onLoadNextPage={relationshipQuery.fetchNextPage}
          retryLabel={retryLabel}
        />
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
