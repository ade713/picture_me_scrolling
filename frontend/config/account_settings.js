export const avatarSettings = Object.freeze({
  acceptedMimeTypes: Object.freeze([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]),
  formatLabel: 'JPEG, PNG, WebP, or GIF',
  maximumFileSizeMegabytes: 5
});

export const emailSettings = Object.freeze({
  maximumLength: 254
});

export const passwordSettings = Object.freeze({
  minimumLength: 6,
  maximumLength: 64
});

export const AVATAR_UPDATE_SUCCESS_MESSAGE = 'Avatar updated successfully';
export const AVATAR_UNREADABLE_MESSAGE = 'Avatar must be a readable image';
export const EMAIL_NOT_VERIFIED_STATUS_MESSAGE = 'Email address is not verified';
export const EMAIL_UPDATE_SUCCESS_MESSAGE = 'Email updated successfully';
export const EMAIL_VERIFIED_STATUS_MESSAGE = 'Verified email address';
export const EMAIL_VERIFICATION_PENDING_MESSAGE = 'Verifying your email address…';
export const EMAIL_VERIFICATION_PENDING_HEADING = 'Verify your email address';
export const EMAIL_VERIFICATION_SUCCESS_HEADING = 'Email verified';
export const EMAIL_VERIFICATION_ERROR_HEADING = 'Verification link unavailable';
export const EMAIL_VERIFICATION_INVALID_LINK_MESSAGE =
  'This link may have expired, already been used, or been replaced.';
export const EMAIL_VERIFICATION_SIGNED_IN_GUIDANCE =
  'Return to Settings and request a new email if your address is still unverified.';
export const EMAIL_VERIFICATION_SIGNED_OUT_GUIDANCE =
  'Sign in and request a new verification email from Settings.';
export const EMAIL_VERIFICATION_SETTINGS_LINK_LABEL = 'Continue to settings';
export const EMAIL_VERIFICATION_LOGIN_LINK_LABEL = 'Continue to login';
export const PASSWORD_CONFIRMATION_MISMATCH_MESSAGE =
  'New password and confirmation must match';
export const PASSWORD_UPDATE_SUCCESS_MESSAGE = 'Password updated successfully';
