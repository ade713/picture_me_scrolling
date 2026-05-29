import React from 'react';

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

  const switchFollow = () => {
    if (post.followed) {
      return () => unfollowUser(post.author_id);
    }

    return () => followUser(post.author_id);
  };

  const renderFollow = () => {
    if (isAuthor) {
      return null;
    }

    if (post.followed) {
      return (
        <button
          className="unfollow-btn"
          onClick={ switchFollow() }>
          Unfollow
        </button>
      );
    }

    return (
      <button
        className="follow-btn"
        onClick={ switchFollow() }>
        Follow
      </button>
    );
  };

  const switchLike = () => {
    if (post.liked) {
      return () => unlikePost(post.id);
    }

    return () => likePost(post.id);
  };

  const likeButton = () => {
    if (isAuthor) {
      return null;
    }

    if (post.liked) {
      return (
        <button className="like-btn-on" onClick={ switchLike() }>
          <i className="fa fa-heart fa-2x" aria-hidden="true"></i>
        </button>
      );
    }

    return (
      <button className="like-btn-off" onClick={ switchLike() }>
        <i className="fa fa-heart-o fa-2x" aria-hidden="true"></i>
      </button>
    );
  };

  const likeCounter = () => (
    <div className="post-likes">
      Likes: { post.likes }
    </div>
  );

  const renderEditDeleteButtons = () => {
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
          onClick={ () => deletePost(post) } >
          <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
        </button>
      </>
    );
  };

  const postFooter = () => (
    <div className="post-footer">
      { likeCounter() }
      <div className="post-options">
        <div className="like-post-btn">
          { likeButton() }
        </div>
        <div className="post-btns">
          { renderEditDeleteButtons() }
        </div>
      </div>
    </div>
  );

  const postHeader = () => (
    <div className="post-header">
      <div className="post-user">
        { post.author }
      </div>
      <div className="follow-hdr">
        { renderFollow() }
      </div>
    </div>
  );

  const renderPost = content => (
    <li className="feed-post">
      <img className="author-avatar" src={ post.author_avatar } />
      <div className="feed-item">
        { content }
      </div>
    </li>
  );

  const audio = () => renderPost(
    <div className="post-audio">
      { postHeader() }

      <div className="post-upload-audio">
        <video width="540" height="120" controls>
          <source src={ post.image_url } />
        </video>
      </div>

      <div className="post-caption">
        { post.title }
      </div>

      { postFooter() }
    </div>
  );

  const link = () => renderPost(
    <div className="post-link">
      { postHeader() }

      <div className="post-link-main">
        <a
          className="posted-link"
          href={ post.url }
          target="_blank"
          rel="noopener noreferrer">
          { post.title }
        </a>
      </div>

      { postFooter() }
    </div>
  );

  const photo = () => renderPost(
    <div className="post-photo">
      { postHeader() }

      <div className="post-upload-photo">
        <img src={ post.image_url } />
      </div>

      <div className="post-caption">
        { post.title }
      </div>

      { postFooter() }
    </div>
  );

  const quote = () => renderPost(
    <div className="post-quote">
      { postHeader() }

      <div className="post-content">
        <div className="quote">
          { post.title }
        </div>
        <div className="source">
          { post.body }
        </div>
      </div>

      { postFooter() }
    </div>
  );

  const text = () => renderPost(
    <div className="post-text">
      { postHeader() }

      <div className="post-content">
        <div className="post-title">
          { post.title }
        </div>
        <div className="post-body">
          { post.body }
        </div>
      </div>

      { postFooter() }
    </div>
  );

  const video = () => renderPost(
    <div className="post-video">
      { postHeader() }

      <div className="post-upload-video">
        <video width="540" height="440" controls>
          <source src={ post.image_url } />
        </video>
      </div>

      <div className="post-caption">
        { post.title }
      </div>

      { postFooter() }
    </div>
  );

  switch (post.post_type) {
    case 'audio':
      return audio();
    case 'link':
      return link();
    case 'photo':
      return photo();
    case 'quote':
      return quote();
    case 'video':
      return video();
    default:
      return text();
  }
};

export default FeedItem;
