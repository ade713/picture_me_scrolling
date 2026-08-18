import React from 'react';
import { Link } from 'react-router-dom';

import { routes } from '../../config/routes';
import { profileViewLabels, profileViews } from '../../config/user_profile';

const profileViewOrder = [
  profileViews.posts,
  profileViews.followers,
  profileViews.following
];

const viewDestination = (profileId, view) => (
  view === profileViews.posts
    ? routes.userProfile(profileId)
    : routes.userProfileView(profileId, view)
);

const ProfileNavigation = ({ activeView, profileId }) => (
  <nav aria-label="Profile views" className="profile-view-navigation">
    {profileViewOrder.map(view => (
      <Link
        aria-current={activeView === view ? 'page' : undefined}
        className="profile-view-link"
        key={view}
        to={viewDestination(profileId, view)}
      >
        {profileViewLabels[view]}
      </Link>
    ))}
  </nav>
);

export default ProfileNavigation;
