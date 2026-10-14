import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { buttonLabels } from '../../config/button_labels';
import { commentMessages, MAXIMUM_COMMENT_LENGTH } from '../../config/comments';
import { useCreateComment } from '../../query/comment_hooks';
import LoadingIndicator from '../loading/loading_indicator';

const CommentForm = ({ postId, onCreated }) => {
  const id = useId();
  const input = useRef(null);
  const form = useRef(null);
  const [formHeight, setFormHeight] = useState(0);
  const [body, setBody] = useState('');
  const creation = useCreateComment(postId);
  const characterCount = Array.from(body).length;
  const isOverLimit = characterCount > MAXIMUM_COMMENT_LENGTH;
  const submitDisabled = creation.isPending || !body.trim() || isOverLimit;

  // Reserve the actual composer height, including validation and resize changes.
  useLayoutEffect(() => {
    const measure = () => setFormHeight(form.current.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(form.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (creation.isSuccess) input.current?.focus();
  }, [creation.isSuccess]);

  const handleChange = event => {
    if (creation.isError || creation.isSuccess) creation.reset();
    setBody(event.target.value);
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (submitDisabled) return;

    creation.mutate(body, {
      onSuccess: comment => {
        onCreated(comment);
        setBody('');
      }
    });
  };

  return (
    <div className="comment-composer-space" style={{ height: formHeight }}>
      <form ref={form} className="comment-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor={id}>{commentMessages.formLabel}</label>
        <textarea
          id={id}
          ref={input}
          value={body}
          placeholder={commentMessages.placeholder}
          onChange={handleChange}
          disabled={creation.isPending}
          required
          rows={2}
          aria-describedby={`${id}-count${creation.isError ? ` ${id}-errors` : ''}`}
          aria-invalid={creation.isError || isOverLimit}
        />
        <p
          id={`${id}-count`}
          className={`comment-character-count${isOverLimit ? ' comment-character-count-over-limit' : ''}`}
        >
          {commentMessages.characterCount(characterCount)}
        </p>
        {creation.isError && (
          <div id={`${id}-errors`} role="alert">
            {(creation.error?.errors || [commentMessages.createError]).map(error => <p key={error}>{error}</p>)}
          </div>
        )}
        {creation.isSuccess && <p role="status">{commentMessages.created}</p>}
        {creation.isPending && <LoadingIndicator label={commentMessages.submitting} />}
        <button type="submit" disabled={submitDisabled}>
          {creation.isPending ? buttonLabels.postingComment : buttonLabels.postComment}
        </button>
      </form>
    </div>
  );
};

export default CommentForm;
