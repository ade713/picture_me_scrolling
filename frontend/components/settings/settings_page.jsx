import React from 'react';
import { Link } from 'react-router-dom';

import { useCurrentUser } from '../../query/session_hooks';
import AvatarSettingsForm from './avatar_settings_form';

const SettingsPage = () => {
  const currentUser = useCurrentUser().data;

  return (
    <div className="settings-page">
      <header className="settings-nav">
        <Link className="settings-brand" to="/dashboard">
          PicMeS
        </Link>
      </header>

      <main className="settings-main">
        <div className="settings-panel">
          <Link className="settings-back-link" to="/dashboard">
            Back to dashboard
          </Link>

          <div className="settings-user-summary">
            <img
              alt={ `${currentUser.username} avatar` }
              className="settings-current-avatar"
              src={ currentUser.avatar_url }
            />
            <div>
              <h1>Settings</h1>
              <p>{ currentUser.username }</p>
            </div>
          </div>

          <section className="settings-section" aria-labelledby="avatar-settings-heading">
            <h2 id="avatar-settings-heading">Avatar</h2>
            <p>Choose a square JPEG, PNG, WebP, or GIF image up to 5 MB.</p>
            <AvatarSettingsForm
              currentAvatarUrl={ currentUser.avatar_url }
              username={ currentUser.username }
            />
          </section>

          <section className="settings-section" aria-labelledby="password-settings-heading">
            <h2 id="password-settings-heading">Password</h2>
            <p>Confirm your current password before choosing a new one.</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
