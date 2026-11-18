import React, { useEffect, useId, useRef, useState } from 'react';
import { commentMessages, MAXIMUM_COMMENT_LENGTH } from '../../config/comments';
import { useCreateReply } from '../../query/comment_hooks';
import LoadingIndicator from '../loading/loading_indicator';

const ReplyForm = ({ postId, commentId, onCreated, onCancel }) => {
  const id = useId();
  const input = useRef(null);
  const [body, setBody] = useState('');
  const creation = useCreateReply(postId, commentId);
  const count = Array.from(body).length;
  const isOverLimit = count > MAXIMUM_COMMENT_LENGTH;
  const submitDisabled = creation.isPending || !body.trim() || isOverLimit;

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => {
    if (creation.isSuccess) input.current?.focus();
  }, [creation.isSuccess]);

  const submit = event => {
    event.preventDefault();
    if (submitDisabled) return;
    creation.mutate(body, {
      onSuccess: reply => {
        setBody('');
        onCreated(reply);
      }
    });
  };

  return (
    <form className="comment-edit-form" onSubmit={submit}>
      <label htmlFor={id}>{commentMessages.replyLabel}</label>
      <textarea id={id} ref={input} value={body} required
        placeholder={commentMessages.replyPlaceholder}
        disabled={creation.isPending}
        aria-invalid={isOverLimit || creation.isError}
        aria-describedby={`${id}-count${creation.isError ? ` ${id}-errors` : ''}`}
        onChange={event => {
          if (creation.isError || creation.isSuccess) creation.reset();
          setBody(event.target.value);
        }} />
      <p id={`${id}-count`} className={`comment-character-count${isOverLimit ? ' comment-character-count-over-limit' : ''}`}>
        {commentMessages.characterCount(count)}
      </p>
      {creation.isError && <div id={`${id}-errors`} role="alert">
        {(creation.error?.errors || [commentMessages.replyError]).map(error => <p key={error}>{error}</p>)}
      </div>}
      {creation.isSuccess && <p role="status">{commentMessages.replyCreated}</p>}
      {creation.isPending && <LoadingIndicator label={commentMessages.postingReply} />}
      <div className="comment-actions">
        <button type="button" disabled={creation.isPending} onClick={onCancel}>{commentMessages.cancel}</button>
        <button type="submit" disabled={submitDisabled}>{commentMessages.postReply}</button>
      </div>
    </form>
  );
};

export default ReplyForm;
