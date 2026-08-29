import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { emailSettings } from '../../config/account_settings';
import { buttonLabels } from '../../config/button_labels';
import {
  FORGOT_PASSWORD_GUIDANCE,
  FORGOT_PASSWORD_HEADING,
  FORGOT_PASSWORD_PENDING_MESSAGE,
  FORGOT_PASSWORD_SUCCESS_GUIDANCE,
  FORGOT_PASSWORD_SUCCESS_HEADING,
  RETURN_TO_LOGIN_LABEL
} from '../../config/password_recovery';
import { routes } from '../../config/routes';
import { useRequestPasswordReset } from '../../query/password_reset_hooks';
import LoadingIndicator from '../loading/loading_indicator';
import PasswordRecoveryLayout from './password_recovery_layout';

const ForgotPasswordPage = () => {
  const requestPasswordReset = useRequestPasswordReset();
  const [email, setEmail] = useState('');
  const successHeading = useRef(null);
  const submitDisabled = requestPasswordReset.isPending || email.trim().length === 0;

  useEffect(() => {
    if (requestPasswordReset.isSuccess) {
      successHeading.current?.focus();
    }
  }, [requestPasswordReset.isSuccess]);

  const handleChange = event => {
    if (requestPasswordReset.isError) {
      requestPasswordReset.reset();
    }

    setEmail(event.target.value);
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (submitDisabled) return;

    requestPasswordReset.mutate(email.trim());
  };

  const renderRequestState = () => {
    if (requestPasswordReset.isSuccess) {
      return (
        <>
          <h1
            id="forgot-password-heading"
            ref={successHeading}
            tabIndex="-1"
          >
            {FORGOT_PASSWORD_SUCCESS_HEADING}
          </h1>
          <p role="status">{requestPasswordReset.data.message}</p>
          <p>{FORGOT_PASSWORD_SUCCESS_GUIDANCE}</p>
        </>
      );
    }

    return (
      <>
        <h1 id="forgot-password-heading">{FORGOT_PASSWORD_HEADING}</h1>
        <p>{FORGOT_PASSWORD_GUIDANCE}</p>

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <label htmlFor="forgot-password-email">Email address</label>
          <input
            autoComplete="email"
            disabled={requestPasswordReset.isPending}
            id="forgot-password-email"
            maxLength={emailSettings.maximumLength}
            onChange={handleChange}
            required
            type="email"
            value={email}
          />

          {requestPasswordReset.isError && (
            <div className="password-recovery-errors" role="alert">
              <ul>
                {requestPasswordReset.error.errors.map(error => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {requestPasswordReset.isPending && (
            <LoadingIndicator label={FORGOT_PASSWORD_PENDING_MESSAGE} />
          )}

          <button disabled={submitDisabled} type="submit">
            {requestPasswordReset.isPending
              ? buttonLabels.sendingResetLink
              : buttonLabels.sendResetLink}
          </button>
        </form>
      </>
    );
  };

  return (
    <PasswordRecoveryLayout headingId="forgot-password-heading">
      {renderRequestState()}
      <Link className="password-recovery-action" to={routes.home}>
        <span aria-hidden="true">←</span> {RETURN_TO_LOGIN_LABEL}
      </Link>
    </PasswordRecoveryLayout>
  );
};

export default ForgotPasswordPage;
