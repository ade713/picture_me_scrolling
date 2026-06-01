import React from 'react';

const FollowButton = ({ isAuthor, onFollow, onUnfollow, post }) => {
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

const LikeButton = ({ isAuthor, onLike, onUnlike, post }) => {
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

const PostHeader = ({ isAuthor, onFollow, onUnfollow, post }) => (
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

const AuthorControls = ({ isAuthor, onDelete, post }) => {
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

const PostFooter = ({ isAuthor, onDelete, onLike, onUnlike, post }) => (
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

const PostFrame = ({ children, post }) => (
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

const FeedItem = ({
  currentUser,
  deletePost,
  followUser,
  likePost,
  post,
  unfollowUser,
  unlikePost
}) => {
  const isAuthor = post.author_id === currentUser.id;

  const postHeader = (
    <PostHeader
      isAuthor={ isAuthor }
      onFollow={ followUser }
      onUnfollow={ unfollowUser }
      post={ post }
    />
  );

  const postFooter = (
    <PostFooter
      isAuthor={ isAuthor }
      onDelete={ deletePost }
      onLike={ likePost }
      onUnlike={ unlikePost }
      post={ post }
    />
  );

  const postBody = {
    audio: (
      <div className="post-audio">
        { postHeader }
        <div className="post-upload-audio">
          <video width="540" height="120" controls>
            <source src={ post.image_url } />
          </video>
        </div>
        <div className="post-caption">
          { post.title }
        </div>
        { postFooter }
      </div>
    ),
    link: (
      <div className="post-link">
        { postHeader }
        <div className="post-link-main">
          <a
            className="posted-link"
            href={ post.url }
            target="_blank"
            rel="noopener noreferrer">
            { post.title }
          </a>
        </div>
        { postFooter }
      </div>
    ),
    photo: (
      <div className="post-photo">
        { postHeader }
        <div className="post-upload-photo">
          <img
            alt={ post.title || 'Uploaded post' }
            src={ post.image_url } />
        </div>
        <div className="post-caption">
          { post.title }
        </div>
        { postFooter }
      </div>
    ),
    quote: (
      <div className="post-quote">
        { postHeader }
        <div className="post-content">
          <div className="quote">
            { post.title }
          </div>
          <div className="source">
            { post.body }
          </div>
        </div>
        { postFooter }
      </div>
    ),
    text: (
      <div className="post-text">
        { postHeader }
        <div className="post-content">
          <div className="post-title">
            { post.title }
          </div>
          <div className="post-body">
            { post.body }
          </div>
        </div>
        { postFooter }
      </div>
    ),
    video: (
      <div className="post-video">
        { postHeader }
        <div className="post-upload-video">
          <video width="540" height="440" controls>
            <source src={ post.image_url } />
          </video>
        </div>
        <div className="post-caption">
          { post.title }
        </div>
        { postFooter }
      </div>
    )
  };

  return (
    <PostFrame post={ post }>
      { postBody[post.post_type] || postBody.text }
    </PostFrame>
  );
};

export default FeedItem;
