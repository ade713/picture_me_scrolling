import React, { useEffect, useRef, useState } from 'react';

import { useUpdateAvatar } from '../../query/account_hooks';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const AvatarSettingsForm = ({ currentAvatarUrl, disabled = false, username }) => {
  const updateAvatar = useUpdateAvatar();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCheckingDimensions, setIsCheckingDimensions] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const revokePreviewUrl = () => {
    if (!previewUrlRef.current) return;

    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  };

  const clearSelection = () => {
    revokePreviewUrl();
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsCheckingDimensions(false);
    setValidationError(null);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => () => revokePreviewUrl(), []);

  const handleFileChange = event => {
    const file = event.target.files[0];

    revokePreviewUrl();
    updateAvatar.reset();
    setSuccessMessage(null);
    setValidationError(null);
    setSelectedFile(file || null);

    if (!file) {
      setPreviewUrl(null);
      setIsCheckingDimensions(false);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    setIsCheckingDimensions(true);
  };

  const handlePreviewLoad = event => {
    const { naturalHeight, naturalWidth } = event.currentTarget;

    setIsCheckingDimensions(false);
    setValidationError(
      naturalWidth === naturalHeight ? null : 'Avatar must be a square image'
    );
  };

  const handlePreviewError = () => {
    setIsCheckingDimensions(false);
    setValidationError('Avatar must be a readable image');
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (!selectedFile || isCheckingDimensions || validationError) return;

    updateAvatar.mutate(selectedFile, {
      onSuccess: () => {
        clearSelection();
        setSuccessMessage('Avatar updated successfully');
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
      <img
        alt={ `${username} avatar preview` }
        className="settings-avatar-preview"
        onError={ previewUrl ? handlePreviewError : undefined }
        onLoad={ previewUrl ? handlePreviewLoad : undefined }
        src={ previewUrl || currentAvatarUrl }
      />

      <label htmlFor="avatar-file">Choose a new avatar</label>
      <input
        accept={ ACCEPTED_IMAGE_TYPES.join(',') }
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
            onClick={ clearSelection }>
            Clear selection
          </button>
        ) }
        <button type="submit" disabled={ disabled || submitDisabled }>
          { updateAvatar.isPending ? 'Updating avatar…' : 'Update avatar' }
        </button>
      </div>
    </form>
  );
};

export default AvatarSettingsForm;
