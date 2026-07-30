import React from "react";
import { Link } from "react-router-dom";

import { avatarSettings } from "../../config/account_settings";
import { routes } from "../../config/routes";
import { useCurrentUser } from "../../query/session_hooks";
import AvatarSettingsForm from "./avatar_settings_form";
import EmailSettingsForm from "./email_settings_form";
import EmailVerificationStatus from "./email_verification_status";
import PasswordSettingsForm from "./password_settings_form";

const SettingsPage = () => {
  const currentUser = useCurrentUser().data;
  const settingsEnabled = currentUser.account_settings_enabled;

  return (
    <div className='settings-page'>
      <header className='settings-nav'>
        <Link className='settings-brand' to={routes.dashboard}>
          PicMeS
        </Link>
      </header>

      <main className='settings-main'>
        <div className='settings-panel'>
          <Link className='settings-back-link' to={routes.dashboard}>
            <span aria-hidden='true'>←</span>
            Back to dashboard
          </Link>

          <div className='settings-content'>
            <div className='settings-summary-column'>
              <div className='settings-user-summary'>
                <img
                  alt={`${currentUser.username} avatar`}
                  className='settings-current-avatar'
                  src={currentUser.avatar_url}
                />
                <div>
                  <h1>Settings</h1>
                  <p>{currentUser.username}</p>
                </div>
              </div>

              {!settingsEnabled && (
                <div className='settings-restriction' role='note'>
                  <strong>Shared account settings are disabled.</strong>
                  <p>
                    This guest account can view settings, but a personal account is required to change an email,
                    avatar, or password.
                  </p>
                </div>
              )}
            </div>

            <div className='settings-forms'>
              <section className='settings-section' aria-labelledby='avatar-settings-heading'>
                <h2 id='avatar-settings-heading'>Avatar</h2>
                <p>
                  Choose a {avatarSettings.formatLabel} image up to{' '}
                  {avatarSettings.maximumFileSizeMegabytes} MB.
                </p>
                <AvatarSettingsForm
                  disabled={!settingsEnabled}
                  username={currentUser.username}
                />
              </section>

              <section className='settings-section' aria-labelledby='email-settings-heading'>
                <h2 id='email-settings-heading'>Email</h2>
                <EmailSettingsForm
                  currentEmail={currentUser.email}
                  disabled={!settingsEnabled}
                />
                <EmailVerificationStatus
                  currentEmail={currentUser.email}
                  disabled={!settingsEnabled}
                  key={currentUser.email}
                  verifiedAt={currentUser.email_verified_at}
                />
              </section>

              <section className='settings-section' aria-labelledby='password-settings-heading'>
                <h2 id='password-settings-heading'>Password</h2>
                <p>Confirm your current password before choosing a new one.</p>
                <PasswordSettingsForm disabled={!settingsEnabled} />
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
