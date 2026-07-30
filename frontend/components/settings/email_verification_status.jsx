import React from 'react';

import {
  EMAIL_NOT_VERIFIED_STATUS_MESSAGE,
  EMAIL_VERIFIED_STATUS_MESSAGE
} from '../../config/account_settings';
import { buttonLabels } from '../../config/button_labels';
import { useResendEmailVerification } from '../../query/email_verification_hooks';

const EmailVerificationStatus = ({
  currentEmail,
  disabled = false,
  verifiedAt
}) => {
  const resendVerification = useResendEmailVerification();
  const canResend = Boolean(currentEmail) && !verifiedAt;

  const handleResend = () => {
    resendVerification.reset();
    resendVerification.mutate();
  };

  return (
    <div className="email-verification-status">
      <p>
        {verifiedAt
          ? EMAIL_VERIFIED_STATUS_MESSAGE
          : EMAIL_NOT_VERIFIED_STATUS_MESSAGE}
      </p>

      {canResend && (
        <button
          disabled={disabled || resendVerification.isPending}
          onClick={handleResend}
          type="button"
        >
          {resendVerification.isPending
            ? buttonLabels.resendingVerificationEmail
            : buttonLabels.resendVerificationEmail}
        </button>
      )}

      {resendVerification.error && (
        <div className="settings-errors" role="alert">
          <ul>
            {resendVerification.error.errors.map(error => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {resendVerification.data?.message && (
        <p role="status">{resendVerification.data.message}</p>
      )}
    </div>
  );
};

export default EmailVerificationStatus;
