import React from 'react';
import { withRouter } from 'react-router';

class FeedItem extends React.Component {
  constructor(props) {
    super(props);

    this.audio = this.audio.bind(this);
    this.link = this.link.bind(this);
    this.photo = this.photo.bind(this);
    this.quote = this.quote.bind(this);
    this.text = this.text.bind(this);
    this.video = this.video.bind(this);

    this.switchLike = this.switchLike.bind(this);
    this.switchFollow = this.switchFollow.bind(this);

    this.post = this.props.post;
  }

  switchFollow() {
    if (this.post.followed) {
      return () => this.props.unfollowUser(this.post.author_id);
    } else {
      return () => this.props.followUser(this.post.author_id);
    }
  }

  renderFollow() {
    if (this.post.author_id !== this.props.currentUser.id) {
      if (this.post.followed) {
        return (
          <button
            className="unfollow-btn"
            onClick={ this.switchFollow() }>
            Unfollow
          </button>
        );
      } else {
        return (
          <button
            className="follow-btn"
            onClick={ this.switchFollow() }>
            Follow
          </button>
        );
      }
    }
  }
  
  switchLike() {
    if (this.post.liked) {
      return () => this.props.unlikePost(this.post.id);
    } else {
      return () => this.props.likePost(this.post.id);
    }
  }

  likeButton() {
    if (this.post.author_id !== this.props.currentUser.id) {
      if (this.post.liked) {
        return (
          <button className="like-btn-on" onClick={ this.switchLike() }>
            <i className="fa fa-heart fa-2x" aria-hidden="true"></i>
          </button>
        );
      } else {
        return (
          <button className="like-btn-off" onClick={ this.switchLike() }>
            <i className="fa fa-heart-o fa-2x" aria-hidden="true"></i>
          </button>
        );
      }
    }
  }

  likeCounter() {
    return (
      <div className="post-likes">
        Likes: { this.post.likes }
      </div>
    );
  }

  renderDeleteButtons() {
    if (this.post.author_id === this.props.currentUser.id) {
      return (
        <button className="delete-post-btn"
          onClick={() => this.props.deletePost(this.post)} >
          <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
        </button>
      );
    }
  }

  audio() {
    return (
      <div className="feed-post">
        <img className="author-avatar" src={ this.post.author_avatar } />
        <li className="feed-item">

          <div className="post-audio">

            <div className="post-header">
              <div className="post-user">
                { this.post.author }
              </div>
              <div className="follow-hdr">
                { this.renderFollow() }
              </div>
            </div>

            <div className="post-upload-audio">
              <video width="540" height="120" controls>
                <source src={ this.post.image_url } />
              </video>
            </div>

            <div className="post-caption">
              { this.post.title }
            </div>

            <div className="post-footer">
              { this.likeCounter() }
              <div className="post-options">
                <div className="like-post-btn">
                  { this.likeButton() }
                </div>
                <div className="post-btns">
                  { this.renderDeleteButtons() }
                </div>
              </div>
            </div>

          </div>
        </li>
      </div>
    );
  }

  link() {
    return (
      <div className="feed-post">
        <img className="author-avatar" src={ this.post.author_avatar } />
        <li className="feed-item">

          <div className="post-link">

            <div className="post-header">
              <div className="post-user">
                { this.post.author }
              </div>
              <div className="follow-hdr">
                { this.renderFollow() }
              </div>
            </div>

            <div className="post-link-main">
              <a className="posted-link" href={ this.post.url } target="_blank">
                { this.post.title }
              </a>
            </div>

            <div className="post-footer">
              { this.likeCounter() }
              <div className="post-options">
                <div className="like-post-btn">
                  { this.likeButton() }
                </div>
                <div className="post-btns">
                  { this.renderDeleteButtons() }
                </div>
              </div>
            </div>

          </div>
        </li>
      </div>
    );
  }

  photo() {
    return (
      <div className="feed-post">
        <img className="author-avatar" src={ this.post.author_avatar } />
        <li className="feed-item">

          <div className="post-photo">

            <div className="post-header">
              <div className="post-user">
                { this.post.author }
              </div>
              <div className="follow-hdr">
                { this.renderFollow() }
              </div>
            </div>

            <div className="post-upload-photo">
              <img src={ this.post.image_url } />
            </div>

            <div className="post-caption">
              { this.post.title }
            </div>

            <div className="post-footer">
              { this.likeCounter() }
              <div className="post-options">
                <div className="like-post-btn">
                  { this.likeButton() }
                </div>
                <div className="post-btns">
                  { this.renderDeleteButtons() }
                </div>
              </div>
            </div>

          </div>
        </li>
      </div>
    );
  }

  quote() {
    return (
      <div className="feed-post">
        <img className="author-avatar" src={ this.post.author_avatar } />
        <li className="feed-item">

          <div className="post-quote">

            <div className="post-header">
              <div className="post-user">
                { this.post.author }
              </div>
              <div className="follow-hdr">
                { this.renderFollow() }
              </div>
            </div>

            <div className="post-content">
              <div className="quote">
                { this.post.title }
              </div>
              <div className="source">
                { this.post.body }
              </div>
            </div>

            <div className="post-footer">
              { this.likeCounter() }
              <div className="post-options">
                <div className="like-post-btn">
                  { this.likeButton() }
                </div>
                <div className="post-btns">
                  { this.renderDeleteButtons() }
                </div>
              </div>
            </div>

          </div>
        </li>
      </div>
    );
  }

  text() {
    return (
      <div className="feed-post">
        <img className="author-avatar" src={ this.post.author_avatar } />
        <li className="feed-item">

          <div className="post-text">

            <div className="post-header">
              <div className="post-user">
                { this.post.author }
              </div>
              <div className="follow-hdr">
                { this.renderFollow() }
              </div>
            </div>

            <div className="post-content">
              <div className="post-title">
                { this.post.title }
              </div>
              <div className="post-body">
                { this.post.body }
              </div>
            </div>

            <div className="post-footer">
              { this.likeCounter() }
              <div className="post-options">
                <div className="like-post-btn">
                  { this.likeButton() }
                </div>
                <div className="post-btns">
                  { this.renderDeleteButtons() }
                </div>
              </div>
            </div>

          </div>
        </li>

      </div>
    );
  }

  video() {
    return (
      <div className="feed-post">
        <img className="author-avatar" src={ this.post.author_avatar } />
        <li className="feed-item">

          <div className="post-video">

            <div className="post-header">
              <div className="post-user">
                { this.post.author }
              </div>
              <div className="follow-hdr">
                { this.renderFollow() }
              </div>
            </div>

            <div className="post-upload-video">
              <video width="540" height="440" controls>
                <source src={ this.post.image_url } />
              </video>
            </div>

            <div className="post-caption">
              { this.post.title }
            </div>

            <div className="post-footer">
              { this.likeCounter() }
              <div className="post-options">
                <div className="like-post-btn">
                  { this.likeButton() }
                </div>
                <div className="post-btns">
                  { this.renderDeleteButtons() }
                </div>
              </div>
            </div>

          </div>
        </li>
      </div>
    );
  }

  render() {
    switch (this.post.post_type) {
      case 'audio':
        return this.audio();
      case 'link':
        return this.link();
      case 'photo':
        return this.photo();
      case 'quote':
        return this.quote();
      case 'video':
        return this.video();
      default:
        return this.text();
    }
  }
}

export default FeedItem;
