import { useEffect, useRef, useState } from 'react';

const useAvatarPreview = () => {
  const previewUrlRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCheckingDimensions, setIsCheckingDimensions] = useState(false);
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
    setIsCheckingDimensions(false);
    setValidationError(null);
  };

  const selectFile = file => {
    revokePreviewUrl();
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

  const validateDimensions = event => {
    const { naturalHeight, naturalWidth } = event.currentTarget;

    setIsCheckingDimensions(false);
    setValidationError(
      naturalWidth === naturalHeight ? null : 'Avatar must be a square image'
    );
  };

  const markPreviewUnreadable = () => {
    setIsCheckingDimensions(false);
    setValidationError('Avatar must be a readable image');
  };

  useEffect(() => () => revokePreviewUrl(), []);

  return {
    selectedFile,
    previewUrl,
    isCheckingDimensions,
    validationError,
    clearSelection,
    markPreviewUnreadable,
    selectFile,
    validateDimensions
  };
};

export default useAvatarPreview;
