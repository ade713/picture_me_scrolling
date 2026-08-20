import React from 'react';
import { Link } from 'react-router-dom';

import { routes } from '../../config/routes';
import { profileCountLabels } from '../../config/user_profile';
import ProfileRelationshipButton from './profile_relationship_button';

const ProfileCount = ({ compactLabel, exactLabel }) => (
  <span className="profile-count" title={exactLabel}>
    <span aria-hidden="true">{compactLabel}</span>
    <span className="profile-count-exact visually-hidden">{exactLabel}</span>
  </span>
);

const ProfileHeader = ({
  currentUserId,
  onFollow,
  onUnfollow,
  profile,
  relationshipPending
}) => {
  const ownProfile = String(currentUserId) === String(profile.id);
  const exactFollowers = profileCountLabels.exactFollowers(profile.follower_count);
  const exactFollowing = profileCountLabels.exactFollowing(profile.following_count);

  return (
    <section className="profile-header" aria-labelledby="profile-heading">
      <img
        alt={`${profile.username} avatar`}
        className="profile-avatar"
        src={profile.avatar_url}
      />

      <div className="profile-header-details">
        <h1 id="profile-heading">{profile.username}</h1>

        <p className="profile-counts">
          <ProfileCount
            compactLabel={profileCountLabels.compactFollowers(profile.follower_count)}
            exactLabel={exactFollowers}
          />
          <span aria-hidden="true">·</span>
          <span className="profile-count-exact visually-hidden">, </span>
          <ProfileCount
            compactLabel={profileCountLabels.compactFollowing(profile.following_count)}
            exactLabel={exactFollowing}
          />
        </p>

        {ownProfile ? (
          <Link className="profile-action" to={routes.settings}>Settings</Link>
        ) : (
          <ProfileRelationshipButton
            className="profile-action"
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            pending={relationshipPending}
            user={profile}
          />
        )}
      </div>
    </section>
  );
};

export default ProfileHeader;
