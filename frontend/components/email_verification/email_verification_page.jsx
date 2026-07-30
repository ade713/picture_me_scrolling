import React, { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  EMAIL_VERIFICATION_ERROR_HEADING,
  EMAIL_VERIFICATION_INVALID_LINK_MESSAGE,
  EMAIL_VERIFICATION_LOGIN_LINK_LABEL,
  EMAIL_VERIFICATION_PENDING_HEADING,
  EMAIL_VERIFICATION_PENDING_MESSAGE,
  EMAIL_VERIFICATION_SETTINGS_LINK_LABEL,
  EMAIL_VERIFICATION_SIGNED_IN_GUIDANCE,
  EMAIL_VERIFICATION_SIGNED_OUT_GUIDANCE,
  EMAIL_VERIFICATION_SUCCESS_HEADING
} from '../../config/account_settings';
import { routes } from '../../config/routes';
import { useVerifyEmail } from '../../query/email_verification_hooks';
import { useCurrentUser } from '../../query/session_hooks';

const EmailVerificationPage = () => {
  const { token } = useParams();
  const currentUser = useCurrentUser().data;
  const verifyEmail = useVerifyEmail();
  const verify = verifyEmail.mutate;
  const resultHeading = useRef(null);
  const destination = currentUser ? routes.settings : routes.home;
  const destinationLabel = currentUser
    ? EMAIL_VERIFICATION_SETTINGS_LINK_LABEL
    : EMAIL_VERIFICATION_LOGIN_LINK_LABEL;

  useEffect(() => {
    verify(token);
  }, [token, verify]);

  useEffect(() => {
    if (verifyEmail.isSuccess || verifyEmail.isError) {
      resultHeading.current?.focus();
    }
  }, [verifyEmail.isError, verifyEmail.isSuccess]);

  const renderResult = () => {
    if (verifyEmail.isSuccess) {
      return (
        <>
          <h1 id="email-verification-heading" ref={resultHeading} tabIndex="-1">
            {EMAIL_VERIFICATION_SUCCESS_HEADING}
          </h1>
          <p role="status">{verifyEmail.data.message}</p>
        </>
      );
    }

    if (verifyEmail.isError) {
      return (
        <>
          <h1 id="email-verification-heading" ref={resultHeading} tabIndex="-1">
            {EMAIL_VERIFICATION_ERROR_HEADING}
          </h1>
          <div className="email-verification-errors" role="alert">
            <ul>
              {verifyEmail.error.errors.map(error => <li key={error}>{error}</li>)}
            </ul>
          </div>
          <p>{EMAIL_VERIFICATION_INVALID_LINK_MESSAGE}</p>
          <p>
            {currentUser
              ? EMAIL_VERIFICATION_SIGNED_IN_GUIDANCE
              : EMAIL_VERIFICATION_SIGNED_OUT_GUIDANCE}
          </p>
        </>
      );
    }

    return (
      <>
        <h1 id="email-verification-heading">
          {EMAIL_VERIFICATION_PENDING_HEADING}
        </h1>
        <p aria-live="polite" role="status">
          {EMAIL_VERIFICATION_PENDING_MESSAGE}
        </p>
      </>
    );
  };

  return (
    <div className="email-verification-page">
      <header className="email-verification-nav">
        <Link to={routes.home}>PicMeS</Link>
      </header>

      <main>
        <section
          aria-labelledby="email-verification-heading"
          className="email-verification-card"
        >
          <div>{renderResult()}</div>
          {(verifyEmail.isSuccess || verifyEmail.isError) && (
            <Link className="email-verification-action" to={destination}>
              {destinationLabel}
            </Link>
          )}
        </section>
      </main>
    </div>
  );
};

export default EmailVerificationPage;
