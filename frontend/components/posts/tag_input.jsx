import React, { useId, useRef } from 'react';

import {
  SELECTED_TAGS_LABEL,
  TAG_INPUT_LABEL,
  TAG_INPUT_MAXIMUM_PLACEHOLDER,
  TAG_INPUT_PLACEHOLDER,
  tagSettings,
  tagMessages
} from '../../config/tags';

const TagInput = ({
  disabled = false,
  draft,
  error,
  onCommit,
  onDraftChange,
  onRemove,
  tags
}) => {
  const inputId = useId();
  const inputRef = useRef(null);
  const tagCountId = `${inputId}-tag-count`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? `${tagCountId} ${errorId}` : tagCountId;
  const maximumReached = tags.length >= tagSettings.maximumCount;

  const handleChange = event => {
    const nextDraft = event.target.value;

    if (nextDraft.endsWith(',')) {
      onCommit(nextDraft.slice(0, -1));
      return;
    }

    onDraftChange(nextDraft);
  };

  const handleKeyDown = event => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    onCommit();
  };

  const handleRemove = tag => {
    onRemove(tag);
    inputRef.current?.focus();
  };

  return (
    <div className="tag-input">
      <label className="tag-input-label" htmlFor={inputId}>
        {TAG_INPUT_LABEL}
      </label>

      {tags.length > 0 && (
        <ul className="tag-input-chips" aria-label={SELECTED_TAGS_LABEL}>
          {tags.map(tag => (
            <li className="tag-input-chip" key={tag}>
              <span>#{tag}</span>
              <button
                aria-label={tagMessages.remove(tag)}
                disabled={disabled}
                onClick={() => handleRemove(tag)}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        id={inputId}
        onBlur={() => onCommit()}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={maximumReached
          ? TAG_INPUT_MAXIMUM_PLACEHOLDER
          : TAG_INPUT_PLACEHOLDER}
        readOnly={maximumReached}
        ref={inputRef}
        type="text"
        value={draft}
      />

      <p
        aria-atomic="true"
        aria-live="polite"
        className="tag-input-count"
        id={tagCountId}
      >
        {tagMessages.count(tags.length)}
      </p>

      {error && (
        <p className="tag-input-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default TagInput;
