import React, { useRef, useState } from 'react';

import {
  AVATAR_UPDATE_SUCCESS_MESSAGE,
  avatarSettings
} from '../../config/account_settings';
import { buttonLabels } from '../../config/button_labels';
import { useUpdateAvatar } from '../../query/account_hooks';
import useAvatarPreview from './use_avatar_preview';

const AvatarSettingsForm = ({ disabled = false, username }) => {
  const updateAvatar = useUpdateAvatar();
  const fileInputRef = useRef(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const {
    selectedFile,
    previewUrl,
    isCheckingDimensions,
    validationError,
    clearSelection,
    markPreviewUnreadable,
    selectFile,
    validateDimensions
  } = useAvatarPreview();

  const resetSelection = () => {
    clearSelection();

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = event => {
    updateAvatar.reset();
    setSuccessMessage(null);
    selectFile(event.target.files[0] || null);
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (!selectedFile || isCheckingDimensions || validationError) return;

    updateAvatar.mutate(selectedFile, {
      onSuccess: () => {
        resetSelection();
        setSuccessMessage(AVATAR_UPDATE_SUCCESS_MESSAGE);
      }
    });
  };

  const errors = [
    ...(validationError ? [validationError] : []),
    ...(updateAvatar.error?.errors || [])
  ];
  const submitDisabled = (
    !selectedFile ||
    isCheckingDimensions ||
    Boolean(validationError) ||
    updateAvatar.isPending
  );

  return (
    <form className="avatar-settings-form" onSubmit={ handleSubmit }>
      { previewUrl && (
        <img
          alt={ `${username} avatar preview` }
          className="settings-avatar-preview"
          onError={ markPreviewUnreadable }
          onLoad={ validateDimensions }
          src={ previewUrl }
        />
      ) }

      <label htmlFor="avatar-file">Choose a new avatar</label>
      <input
        accept={ avatarSettings.acceptedMimeTypes.join(',') }
        disabled={ disabled || updateAvatar.isPending }
        id="avatar-file"
        onChange={ handleFileChange }
        ref={ fileInputRef }
        type="file"
      />

      { errors.length > 0 && (
        <div className="settings-errors" role="alert">
          <ul>
            { errors.map(error => <li key={ error }>{ error }</li>) }
          </ul>
        </div>
      ) }

      { successMessage && <p role="status">{ successMessage }</p> }

      <div className="settings-form-actions">
        { selectedFile && (
          <button
            type="button"
            disabled={ disabled || updateAvatar.isPending }
            onClick={ resetSelection }>
            {buttonLabels.clearSelection}
          </button>
        ) }
        <button type="submit" disabled={ disabled || submitDisabled }>
          { updateAvatar.isPending ? buttonLabels.updatingAvatar : buttonLabels.updateAvatar }
        </button>
      </div>
    </form>
  );
};

export default AvatarSettingsForm;
