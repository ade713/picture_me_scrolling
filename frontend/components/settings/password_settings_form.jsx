import React, { useState } from 'react';

import { useUpdatePassword } from '../../query/account_hooks';

const EMPTY_PASSWORDS = {
  current_password: '',
  password: '',
  password_confirmation: ''
};

const PasswordSettingsForm = ({ disabled = false }) => {
  const updatePassword = useUpdatePassword();
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [validationError, setValidationError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = event => {
    const { name, value } = event.target;

    updatePassword.reset();
    setValidationError(null);
    setSuccessMessage(null);
    setPasswords(currentPasswords => ({
      ...currentPasswords,
      [name]: value
    }));
  };

  const handleSubmit = event => {
    event.preventDefault();

    if (passwords.password !== passwords.password_confirmation) {
      setValidationError('New password and confirmation must match');
      return;
    }

    updatePassword.mutate(passwords, {
      onSuccess: () => {
        setPasswords(EMPTY_PASSWORDS);
        setValidationError(null);
        setSuccessMessage('Password updated successfully');
      }
    });
  };

  const errors = [
    ...(validationError ? [validationError] : []),
    ...(updatePassword.error?.errors || [])
  ];
  const controlsDisabled = disabled || updatePassword.isPending;

  return (
    <form className="password-settings-form" onSubmit={ handleSubmit }>
      <label htmlFor="current-password">Current password</label>
      <input
        autoComplete="current-password"
        disabled={ controlsDisabled }
        id="current-password"
        name="current_password"
        onChange={ handleChange }
        required
        type="password"
        value={ passwords.current_password }
      />

      <label htmlFor="new-password">New password</label>
      <input
        aria-describedby="new-password-requirements"
        autoComplete="new-password"
        disabled={ controlsDisabled }
        id="new-password"
        minLength="6"
        name="password"
        onChange={ handleChange }
        required
        type="password"
        value={ passwords.password }
      />
      <p id="new-password-requirements">
        Use at least 6 characters and no more than 72 bytes.
      </p>

      <label htmlFor="password-confirmation">Confirm new password</label>
      <input
        autoComplete="new-password"
        disabled={ controlsDisabled }
        id="password-confirmation"
        minLength="6"
        name="password_confirmation"
        onChange={ handleChange }
        required
        type="password"
        value={ passwords.password_confirmation }
      />

      { errors.length > 0 && (
        <div className="settings-errors" role="alert">
          <ul>
            { errors.map(error => <li key={ error }>{ error }</li>) }
          </ul>
        </div>
      ) }

      { successMessage && <p role="status">{ successMessage }</p> }

      <button type="submit" disabled={ controlsDisabled }>
        { updatePassword.isPending ? 'Updating password…' : 'Update password' }
      </button>
    </form>
  );
};

export default PasswordSettingsForm;
