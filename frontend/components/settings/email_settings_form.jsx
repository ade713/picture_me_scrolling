import React, { useState } from 'react';

import {
  EMAIL_UPDATE_SUCCESS_MESSAGE,
  emailSettings
} from '../../config/account_settings';
import { buttonLabels } from '../../config/button_labels';
import { useUpdateEmail } from '../../query/account_hooks';

const EmailSettingsForm = ({ currentEmail, disabled = false }) => {
  const updateEmail = useUpdateEmail();
  const savedEmail = currentEmail ?? '';
  const [email, setEmail] = useState(savedEmail);
  const [successMessage, setSuccessMessage] = useState(null);
  const normalizedEmail = email.trim().toLowerCase();
  const controlsDisabled = disabled || updateEmail.isPending;
  const submitDisabled = (
    controlsDisabled ||
    normalizedEmail.length === 0 ||
    normalizedEmail === savedEmail.toLowerCase()
  );

  const handleChange = event => {
    updateEmail.reset();
    setSuccessMessage(null);
    setEmail(event.target.value);
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (submitDisabled) return;

    updateEmail.mutate(email, {
      onSuccess: currentUser => {
        setEmail(currentUser.email);
        setSuccessMessage(EMAIL_UPDATE_SUCCESS_MESSAGE);
      }
    });
  };

  return (
    <form className="email-settings-form" onSubmit={ handleSubmit }>
      <label htmlFor="account-email">Email address</label>
      <input
        autoComplete="email"
        disabled={ controlsDisabled }
        id="account-email"
        maxLength={ emailSettings.maximumLength }
        onChange={ handleChange }
        required
        type="email"
        value={ email }
      />

      { updateEmail.error && (
        <div className="settings-errors" role="alert">
          <ul>
            { updateEmail.error.errors.map(error => <li key={ error }>{ error }</li>) }
          </ul>
        </div>
      ) }

      { successMessage && <p role="status">{ successMessage }</p> }

      <button type="submit" disabled={ submitDisabled }>
        { updateEmail.isPending ? buttonLabels.updatingEmail : buttonLabels.updateEmail }
      </button>
    </form>
  );
};

export default EmailSettingsForm;
