import { useState } from 'react';

import {
  TAG_COUNT_ERROR,
  TAG_DUPLICATE_ERROR,
  TAG_FORMAT_ERROR,
  TAG_LENGTH_ERROR,
  tagSettings
} from '../../config/tags';

export const normalizeTag = tag => tag.trim().toLowerCase();

export const validateTagDraft = (draft, tags) => {
  const normalizedTag = normalizeTag(draft);

  if (!normalizedTag) return null;
  if (normalizedTag.length > tagSettings.maximumLength) return TAG_LENGTH_ERROR;
  if (!tagSettings.namePattern.test(normalizedTag)) return TAG_FORMAT_ERROR;
  if (tags.includes(normalizedTag)) return TAG_DUPLICATE_ERROR;
  if (tags.length >= tagSettings.maximumCount) return TAG_COUNT_ERROR;

  return null;
};

const useTagInput = (initialTags = []) => {
  const [tags, setTags] = useState(initialTags);
  const [draft, setDraft] = useState('');
  const error = validateTagDraft(draft, tags);

  const commitDraft = (draftOverride = draft) => {
    const normalizedTag = normalizeTag(draftOverride);
    const validationError = validateTagDraft(draftOverride, tags);

    if (validationError) {
      setDraft(draftOverride);
      return null;
    }

    if (!normalizedTag) {
      setDraft('');
      return tags;
    }

    const nextTags = [...tags, normalizedTag];
    setTags(nextTags);
    setDraft('');
    return nextTags;
  };

  const removeTag = tagToRemove => {
    setTags(currentTags => currentTags.filter(tag => tag !== tagToRemove));
  };

  const reset = (nextTags = []) => {
    setTags(nextTags);
    setDraft('');
  };

  return {
    tags,
    commitDraft,
    reset,
    inputProps: {
      draft,
      error,
      onCommit: commitDraft,
      onDraftChange: setDraft,
      onRemove: removeTag,
      tags
    }
  };
};

export default useTagInput;
