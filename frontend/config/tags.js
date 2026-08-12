export const tagSettings = Object.freeze({
  maximumCount: 5,
  maximumLength: 30,
  namePattern: /^[a-z0-9]+(?:_[a-z0-9]+)*$/
});

export const normalizeTag = tag => tag.trim().toLowerCase();

export const TAG_COUNT_ERROR =
  `Posts can have up to ${tagSettings.maximumCount} tags`;
export const TAG_DUPLICATE_ERROR = 'That tag has already been added';
export const TAG_FORMAT_ERROR =
  'Use letters and numbers, with single underscores between words';
export const TAG_LENGTH_ERROR =
  `Tags can have up to ${tagSettings.maximumLength} characters`;
export const TAG_INPUT_LABEL = 'Tags';
export const TAG_INPUT_MAXIMUM_PLACEHOLDER = 'Maximum tags added';
export const TAG_INPUT_PLACEHOLDER = 'Add tags';
export const SELECTED_TAGS_LABEL = 'Selected tags';

export const tagMessages = Object.freeze({
  count: count => `${count} of ${tagSettings.maximumCount} tags`,
  remove: tag => `Remove ${tag} tag`
});
