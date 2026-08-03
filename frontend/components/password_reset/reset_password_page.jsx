import React, { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  CONTINUE_TO_LOGIN_LABEL,
  PASSWORD_RESET_LINK_ERRORS,
  REQUEST_NEW_RESET_LINK_LABEL,
  RESET_PASSWORD_ERROR_HEADING,
  RESET_PASSWORD_GUIDANCE,
  RESET_PASSWORD_HEADING,
  RESET_PASSWORD_INVALID_LINK_GUIDANCE,
  RESET_PASSWORD_SUCCESS_GUIDANCE,
  RESET_PASSWORD_SUCCESS_HEADING,
  RETURN_TO_LOGIN_LABEL
} from '../../config/password_recovery';
import { routes } from '../../config/routes';
import { useResetPassword } from '../../query/password_reset_hooks';
import ResetPasswordForm from './reset_password_form';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const resetPassword = useResetPassword();
  const resultHeading = useRef(null);
  const linkError = resetPassword.error?.errors.find(error => (
    PASSWORD_RESET_LINK_ERRORS.includes(error)
  ));

  useEffect(() => {
    if (resetPassword.isSuccess || linkError) {
      resultHeading.current?.focus();
    }
  }, [linkError, resetPassword.isSuccess]);

  const renderResetState = () => {
    if (resetPassword.isSuccess) {
      return (
        <>
          <h1
            id="reset-password-heading"
            ref={resultHeading}
            tabIndex="-1"
          >
            {RESET_PASSWORD_SUCCESS_HEADING}
          </h1>
          <p role="status">{resetPassword.data.message}</p>
          <p>{RESET_PASSWORD_SUCCESS_GUIDANCE}</p>
        </>
      );
    }

    if (linkError) {
      return (
        <>
          <h1
            id="reset-password-heading"
            ref={resultHeading}
            tabIndex="-1"
          >
            {RESET_PASSWORD_ERROR_HEADING}
          </h1>
          <div className="password-reset-errors" role="alert">
            <ul><li>{linkError}</li></ul>
          </div>
          <p>{RESET_PASSWORD_INVALID_LINK_GUIDANCE}</p>
        </>
      );
    }

    return (
      <>
        <h1 id="reset-password-heading">{RESET_PASSWORD_HEADING}</h1>
        <p>{RESET_PASSWORD_GUIDANCE}</p>
        <ResetPasswordForm resetPassword={resetPassword} token={token} />
      </>
    );
  };

  let actionRoute = routes.home;
  let actionLabel = RETURN_TO_LOGIN_LABEL;

  if (linkError) {
    actionRoute = routes.forgotPassword;
    actionLabel = REQUEST_NEW_RESET_LINK_LABEL;
  } else if (resetPassword.isSuccess) {
    actionLabel = CONTINUE_TO_LOGIN_LABEL;
  }

  return (
    <div className="password-recovery-page">
      <header className="password-recovery-nav">
        <Link to={routes.home}>PicMeS</Link>
      </header>

      <main>
        <section
          aria-labelledby="reset-password-heading"
          className="password-recovery-card"
        >
          {renderResetState()}
          <Link className="password-recovery-action" to={actionRoute}>
            {actionLabel}
          </Link>
        </section>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
