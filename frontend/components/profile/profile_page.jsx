import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { APP_NAME, BACK_TO_DASHBOARD_LABEL } from '../../config/app';
import { profileMessages } from '../../config/user_profile';
import { routes } from '../../config/routes';
import { useUser } from '../../query/user_hooks';
import AccountMenu from '../dashboard/account_menu';

const ProfilePage = () => {
  const { id } = useParams();
  const profileQuery = useUser(id);

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
      <section className="profile-identity" aria-labelledby="profile-heading">
        <img
          alt={`${profileQuery.data.username} avatar`}
          className="profile-avatar"
          src={profileQuery.data.avatar_url}
        />
        <h1 id="profile-heading">{profileQuery.data.username}</h1>
      </section>
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
