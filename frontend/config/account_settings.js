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
