import React, { useRef } from 'react';
import Modal from 'react-modal';

import { imageLoadingProps } from '../../util/media_loading_util';

const postActionLabel = post => post.title || `post by ${post.author}`;
const followActionLabel = post => `Follow ${post.author}`;
const unfollowActionLabel = post => `Unfollow ${post.author}`;
const likeActionLabel = post => `Like ${postActionLabel(post)}`;
const unlikeActionLabel = post => `Unlike ${postActionLabel(post)}`;
const editActionLabel = post => `Edit ${postActionLabel(post)}`;
const deleteActionLabel = post => `Delete ${postActionLabel(post)}`;

export const FollowButton = ({ isAuthor, onFollow, onUnfollow, post }) => {
  if (isAuthor) {
    return null;
  }

  if (post.followed) {
    return (
      <button
        aria-label={ unfollowActionLabel(post) }
        className="unfollow-btn"
        onClick={ () => onUnfollow(post.author_id) }
        title={ unfollowActionLabel(post) }>
        Unfollow
      </button>
    );
  }

  return (
    <button
      aria-label={ followActionLabel(post) }
      className="follow-btn"
      onClick={ () => onFollow(post.author_id) }
      title={ followActionLabel(post) }>
      Follow
    </button>
  );
};

export const LikeButton = ({ isAuthor, onLike, onUnlike, post }) => {
  if (isAuthor) {
    return null;
  }

  if (post.liked) {
    return (
      <button
        aria-label={ unlikeActionLabel(post) }
        className="like-btn-on"
        onClick={ () => onUnlike(post.id) }
        title={ unlikeActionLabel(post) }>
        <i className="fa fa-heart fa-2x" aria-hidden="true"></i>
      </button>
    );
  }

  return (
    <button
      aria-label={ likeActionLabel(post) }
      className="like-btn-off"
      onClick={ () => onLike(post.id) }
      title={ likeActionLabel(post) }>
      <i className="fa fa-heart-o fa-2x" aria-hidden="true"></i>
    </button>
  );
};

export const PostHeader = ({ isAuthor, onFollow, onUnfollow, post }) => (
  <div className="post-header">
    <div className="post-user">
      { post.author }
    </div>
    <div className="follow-hdr">
      <FollowButton
        isAuthor={ isAuthor }
        onFollow={ onFollow }
        onUnfollow={ onUnfollow }
        post={ post }
      />
    </div>
  </div>
);

export const AuthorControls = ({ isAuthor, onDelete, onEdit, post }) => {
  if (!isAuthor) {
    return null;
  }

  return (
    <>
      <button
        aria-label={ editActionLabel(post) }
        className="edit-post-btn"
        onClick={ () => onEdit(post) }
        title={ editActionLabel(post) }>
        <i
          className="fa fa-pencil-square-o fa-2x"
          id="edit-btn-icon"
          aria-hidden="true"></i>
      </button>
      <button
        aria-label={ deleteActionLabel(post) }
        className="delete-post-btn"
        onClick={ () => onDelete(post) }
        title={ deleteActionLabel(post) }>
        <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
      </button>
    </>
  );
};

export const PostFooter = ({ isAuthor, onDelete, onEdit, onLike, onUnlike, post }) => (
  <div className="post-footer">
    <div className="post-likes">
      Likes: { post.likes }
    </div>
    <div className="post-options">
      <div className="like-post-btn">
        <LikeButton
          isAuthor={ isAuthor }
          onLike={ onLike }
          onUnlike={ onUnlike }
          post={ post }
        />
      </div>
      <div className="post-btns">
        <AuthorControls
          isAuthor={ isAuthor }
          onDelete={ onDelete }
          onEdit={ onEdit }
          post={ post }
        />
      </div>
    </div>
  </div>
);

export const DeletePostConfirmation = ({ onCancel, onConfirm, post }) => {
  const cancelButtonRef = useRef(null);

  return (
    <Modal
      isOpen
      contentLabel="Delete post?"
      className="delete-post-confirmation-panel"
      overlayClassName="delete-post-confirmation"
      shouldCloseOnOverlayClick={ false }
      onAfterOpen={ () => {
        window.requestAnimationFrame(() => cancelButtonRef.current?.focus());
      } }
      onRequestClose={ onCancel }>
      <h2>Delete post?</h2>
      <p>
        Are you sure you want to delete { postActionLabel(post) }?
      </p>
      <div className="delete-post-confirmation-actions">
        <button
          ref={ cancelButtonRef }
          className="delete-post-cancel-btn"
          onClick={ onCancel }>
          No
        </button>
        <button
          className="delete-post-confirm-btn"
          onClick={ onConfirm }>
          Yes
        </button>
      </div>
    </Modal>
  );
};

export const PostFrame = ({ children, post, priorityMedia = false }) => (
  <li className="feed-post">
    <img
      alt={ `${post.author} avatar` }
      className="author-avatar"
      { ...imageLoadingProps(priorityMedia) }
      src={ post.author_avatar } />
    <div className="feed-item">
      { children }
    </div>
  </li>
);
