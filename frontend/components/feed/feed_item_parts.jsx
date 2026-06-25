import React from 'react';

import { imageLoadingProps } from '../../util/media_loading_util';

const postActionLabel = post => post.title || `post by ${post.author}`;

export const FollowButton = ({ isAuthor, onFollow, onUnfollow, post }) => {
  if (isAuthor) {
    return null;
  }

  if (post.followed) {
    return (
      <button
        className="unfollow-btn"
        onClick={ () => onUnfollow(post.author_id) }>
        Unfollow
      </button>
    );
  }

  return (
    <button
      className="follow-btn"
      onClick={ () => onFollow(post.author_id) }>
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
        aria-label={ `Unlike ${postActionLabel(post)}` }
        className="like-btn-on"
        onClick={ () => onUnlike(post.id) }>
        <i className="fa fa-heart fa-2x" aria-hidden="true"></i>
      </button>
    );
  }

  return (
    <button
      aria-label={ `Like ${postActionLabel(post)}` }
      className="like-btn-off"
      onClick={ () => onLike(post.id) }>
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

export const AuthorControls = ({ canEdit, isAuthor, onDelete, onEdit, post }) => {
  if (!isAuthor) {
    return null;
  }

  return (
    <>
      { canEdit && (
        <button
          aria-label={ `Edit ${postActionLabel(post)}` }
          className="edit-post-btn"
          onClick={ () => onEdit(post) }>
          <i
            className="fa fa-pencil-square-o fa-2x"
            id="edit-btn-icon"
            aria-hidden="true"></i>
        </button>
      ) }
      <button
        aria-label={ `Delete ${postActionLabel(post)}` }
        className="delete-post-btn"
        onClick={ () => onDelete(post) } >
        <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
      </button>
    </>
  );
};

export const PostFooter = ({ canEdit, isAuthor, onDelete, onEdit, onLike, onUnlike, post }) => (
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
          canEdit={ canEdit }
          isAuthor={ isAuthor }
          onDelete={ onDelete }
          onEdit={ onEdit }
          post={ post }
        />
      </div>
    </div>
  </div>
);

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
