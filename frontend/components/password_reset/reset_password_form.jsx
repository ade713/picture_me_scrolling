import React, { useState } from 'react';

import {
  PASSWORD_CONFIRMATION_MISMATCH_MESSAGE,
  PASSWORD_REQUIREMENTS_MESSAGE,
  passwordSettings
} from '../../config/account_settings';
import { buttonLabels } from '../../config/button_labels';
import { RESET_PASSWORD_PENDING_MESSAGE } from '../../config/password_recovery';

const EMPTY_PASSWORDS = {
  password: '',
  password_confirmation: ''
};

const ResetPasswordForm = ({ resetPassword, token }) => {
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [validationError, setValidationError] = useState(null);
  const controlsDisabled = resetPassword.isPending;
  const submitDisabled = (
    controlsDisabled || Object.values(passwords).some(password => password.length === 0)
  );
  const errors = [
    ...(validationError ? [validationError] : []),
    ...(resetPassword.error?.errors || [])
  ];

  const handleChange = event => {
    const { name, value } = event.target;

    if (resetPassword.isError) {
      resetPassword.reset();
    }
    setValidationError(null);
    setPasswords(currentPasswords => ({
      ...currentPasswords,
      [name]: value
    }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (submitDisabled) return;

    if (passwords.password !== passwords.password_confirmation) {
      setValidationError(PASSWORD_CONFIRMATION_MISMATCH_MESSAGE);
      return;
    }

    resetPassword.mutate({ token, ...passwords });
  };

  return (
    <form className="password-reset-form" onSubmit={handleSubmit}>
      <label htmlFor="recovery-new-password">New password</label>
      <input
        aria-describedby="recovery-password-requirements"
        autoComplete="new-password"
        disabled={controlsDisabled}
        id="recovery-new-password"
        maxLength={passwordSettings.maximumLength}
        minLength={passwordSettings.minimumLength}
        name="password"
        onChange={handleChange}
        required
        type="password"
        value={passwords.password}
      />
      <p id="recovery-password-requirements">
        {PASSWORD_REQUIREMENTS_MESSAGE}
      </p>

      <label htmlFor="recovery-password-confirmation">Confirm new password</label>
      <input
        autoComplete="new-password"
        disabled={controlsDisabled}
        id="recovery-password-confirmation"
        maxLength={passwordSettings.maximumLength}
        minLength={passwordSettings.minimumLength}
        name="password_confirmation"
        onChange={handleChange}
        required
        type="password"
        value={passwords.password_confirmation}
      />

      {errors.length > 0 && (
        <div className="password-reset-errors" role="alert">
          <ul>
            {errors.map(error => <li key={error}>{error}</li>)}
          </ul>
        </div>
      )}

      {resetPassword.isPending && (
        <p aria-live="polite" role="status">
          {RESET_PASSWORD_PENDING_MESSAGE}
        </p>
      )}

      <button disabled={submitDisabled} type="submit">
        {resetPassword.isPending
          ? buttonLabels.resettingPassword
          : buttonLabels.resetPassword}
      </button>
    </form>
  );
};

export default ResetPasswordForm;
