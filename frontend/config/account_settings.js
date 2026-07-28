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

export const passwordSettings = Object.freeze({
  minimumLength: 6,
  maximumLength: 64
});

export const AVATAR_UPDATE_SUCCESS_MESSAGE = 'Avatar updated successfully';
export const AVATAR_UNREADABLE_MESSAGE = 'Avatar must be a readable image';
export const PASSWORD_CONFIRMATION_MISMATCH_MESSAGE =
  'New password and confirmation must match';
export const PASSWORD_UPDATE_SUCCESS_MESSAGE = 'Password updated successfully';
