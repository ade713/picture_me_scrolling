import React, { useEffect, useId, useRef, useState } from 'react';
import Modal from 'react-modal';

import { buttonLabels } from '../../config/button_labels';
import { commentMessages, MAXIMUM_COMMENT_LENGTH } from '../../config/comments';
import { useDeleteComment, useUpdateComment } from '../../query/comment_hooks';
import LoadingIndicator from '../loading/loading_indicator';

const CommentActions = ({ comment, postId, onUpdated, onDeleted }) => {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [body, setBody] = useState(comment.body);
  const editButton = useRef(null);
  const input = useRef(null);
  const cancelDelete = useRef(null);
  const id = useId();
  const update = useUpdateComment(postId);
  const deletion = useDeleteComment(postId);
  const count = Array.from(body).length;
  const isOverLimit = count > MAXIMUM_COMMENT_LENGTH;
  const saveDisabled = update.isPending || !body.trim() || isOverLimit;

  useEffect(() => {
    if (editing) input.current?.focus();
  }, [editing]);

  const closeEditor = () => {
    setEditing(false);
    window.requestAnimationFrame(() => editButton.current?.focus());
  };

  const save = async event => {
    event.preventDefault();
    if (saveDisabled) return;
    let updated;
    try {
      updated = await update.mutateAsync({ id: comment.id, body });
    } catch {
      // The mutation exposes the error; preserve the draft for retry.
      return;
    }

    onUpdated(updated);
    closeEditor();
  };

  const remove = async () => {
    if (deletion.isPending) return;
    try {
      await deletion.mutateAsync(comment.id);
    } catch {
      // Keep the confirmation open with its retryable error.
      return;
    }

    setConfirming(false);
    // Runs even if authoritative refetching has already unmounted this item.
    onDeleted(comment.id);
  };

  return (
    <>
      <div className="comment-author-actions">
        <button
          ref={editButton}
          type="button"
          className="edit-post-btn"
          aria-label={commentMessages.edit}
          title={commentMessages.edit}
          disabled={editing}
          onClick={() => {
            update.reset();
            setBody(comment.body);
            setEditing(true);
          }}>
          <i className="fa fa-pencil-square-o fa-2x" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="delete-post-btn"
          aria-label={commentMessages.delete}
          title={commentMessages.delete}
          disabled={editing}
          onClick={() => {
            deletion.reset();
            setConfirming(true);
          }}>
          <i className="fa fa-trash fa-2x" aria-hidden="true" />
        </button>
      </div>
      {editing && (
        <form className="comment-edit-form" onSubmit={save}>
          <label htmlFor={id}>{commentMessages.editLabel}</label>
          <textarea id={id} ref={input} value={body} required disabled={update.isPending}
            aria-invalid={isOverLimit || update.isError}
            aria-describedby={`${id}-count${update.isError ? ` ${id}-errors` : ''}`}
            onChange={event => {
              if (update.isError) update.reset();
              setBody(event.target.value);
            }} />
          <p id={`${id}-count`} className={`comment-character-count${isOverLimit ? ' comment-character-count-over-limit' : ''}`}>
            {commentMessages.characterCount(count)}
          </p>
          {update.isError && <div id={`${id}-errors`} role="alert">
            {(update.error?.errors || [commentMessages.updateError]).map(error => <p key={error}>{error}</p>)}
          </div>}
          {update.isPending && <LoadingIndicator label={commentMessages.saving} />}
          <div className="comment-actions">
            <button type="button" disabled={update.isPending} onClick={closeEditor}>
              {commentMessages.cancel}
            </button>
            <button type="submit" disabled={saveDisabled}>
              {commentMessages.save}
            </button>
          </div>
        </form>
      )}
      {confirming && (
        <Modal isOpen contentLabel={commentMessages.deleteHeading}
          className="delete-post-confirmation-panel"
          overlayClassName="delete-post-confirmation"
          shouldCloseOnOverlayClick={false}
          onAfterOpen={() => cancelDelete.current?.focus()}
          onRequestClose={() => { if (!deletion.isPending) setConfirming(false); }}>
          <h2>{commentMessages.deleteHeading}</h2>
          <p>{commentMessages.deleteGuidance}</p>
          {deletion.isError && <div role="alert">
            {(deletion.error?.errors || [commentMessages.deleteError]).map(error => <p key={error}>{error}</p>)}
          </div>}
          {deletion.isPending && <LoadingIndicator label={commentMessages.deleting} />}
          <div className="delete-post-confirmation-actions">
            <button
              ref={cancelDelete}
              className="delete-post-cancel-btn"
              disabled={deletion.isPending}
              onClick={() => setConfirming(false)}>
              {buttonLabels.cancelDelete}
            </button>
            <button
              className="delete-post-confirm-btn"
              disabled={deletion.isPending}
              onClick={remove}>
              {buttonLabels.confirmDelete}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default CommentActions;
