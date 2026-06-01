import React from 'react';

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
      <button className="like-btn-on" onClick={ () => onUnlike(post.id) }>
        <i className="fa fa-heart fa-2x" aria-hidden="true"></i>
      </button>
    );
  }

  return (
    <button className="like-btn-off" onClick={ () => onLike(post.id) }>
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

export const AuthorControls = ({ isAuthor, onDelete, post }) => {
  if (!isAuthor) {
    return null;
  }

  return (
    <>
      <button className="edit-post-btn">
        <i
          className="fa fa-pencil-square-o fa-2x"
          id="edit-btn-icon"
          aria-hidden="true"></i>
      </button>
      <button className="delete-post-btn"
        onClick={ () => onDelete(post) } >
        <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
      </button>
    </>
  );
};

export const PostFooter = ({ isAuthor, onDelete, onLike, onUnlike, post }) => (
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
          post={ post }
        />
      </div>
    </div>
  </div>
);

export const PostFrame = ({ children, post }) => (
  <li className="feed-post">
    <img
      alt={ `${post.author} avatar` }
      className="author-avatar"
      src={ post.author_avatar } />
    <div className="feed-item">
      { children }
    </div>
  </li>
);
