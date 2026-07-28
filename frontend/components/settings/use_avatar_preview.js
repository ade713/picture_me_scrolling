import { useEffect, useRef, useState } from 'react';

import { AVATAR_UNREADABLE_MESSAGE } from '../../config/account_settings';

const useAvatarPreview = () => {
  const previewUrlRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const revokePreviewUrl = () => {
    if (!previewUrlRef.current) return;

    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  };

  const clearSelection = () => {
    revokePreviewUrl();
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsLoadingPreview(false);
    setValidationError(null);
  };

  const selectFile = file => {
    revokePreviewUrl();
    setValidationError(null);
    setSelectedFile(file || null);

    if (!file) {
      setPreviewUrl(null);
      setIsLoadingPreview(false);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    setIsLoadingPreview(true);
  };

  const markPreviewReady = () => {
    setIsLoadingPreview(false);
    setValidationError(null);
  };

  const markPreviewUnreadable = () => {
    setIsLoadingPreview(false);
    setValidationError(AVATAR_UNREADABLE_MESSAGE);
  };

  useEffect(() => () => revokePreviewUrl(), []);

  return {
    selectedFile,
    previewUrl,
    isLoadingPreview,
    validationError,
    clearSelection,
    markPreviewUnreadable,
    markPreviewReady,
    selectFile
  };
};

export default useAvatarPreview;
