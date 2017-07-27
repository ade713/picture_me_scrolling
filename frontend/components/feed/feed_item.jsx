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
  }

  audio() {
    return (
      <li className="feed-item">
        <div className="post-audio">

          <div className="post-header">
            <div className="post-user">
              { this.props.post.author }
            </div>
          </div>

          <div className="post-upload-audio">
            <video width="540" height="120" controls>
              <source src={ this.props.post.image_url } />
            </video>
          </div>

          <div className="post-caption">
            { this.props.post.title }
          </div>

          <div className="post-footer">
            <div className="post-options">
              <button className="like-post-btn">
                <i className="fa fa-heart-o fa-2x" aria-hidden="true"></i>
              </button>
              <button className="edit-post-btn">
                <i className="fa fa-pencil-square-o fa-2x"
                  id="edit-btn-icon"
                  aria-hidden="true"></i>
              </button>
              <button className="delete-post-btn"
                onClick={ () => this.props.deletePost(this.props.post) } >
                <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
              </button>
            </div>
          </div>

        </div>
      </li>
    );
  }

  link() {
    return (
      <li className="feed-item">
        <div className="post-link">

          <div className="post-header">
            <div className="post-user">
              { this.props.post.author }
            </div>
          </div>

          <div className="post-link-main">
            <a className="posted-link" href={ this.props.post.url } target="_blank">
              { this.props.post.title }
            </a>
          </div>

          <div className="post-footer">
            <div className="post-options">
              <button className="like-post-btn">
                <i className="fa fa-heart-o fa-2x" aria-hidden="true"></i>
              </button>
              <button className="edit-post-btn">
                <i className="fa fa-pencil-square-o fa-2x"
                  id="edit-btn-icon"
                  aria-hidden="true"></i>
              </button>
              <button className="delete-post-btn"
                onClick={ () => this.props.deletePost(this.props.post) } >
                <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
              </button>
            </div>
          </div>

        </div>
      </li>
    );
  }

  photo() {
    return (
      <li className="feed-item">
        <div className="post-photo">

          <div className="post-header">
            <div className="post-user">
              { this.props.post.author }
            </div>
          </div>

          <div className="post-upload-photo">
            <img src={ this.props.post.image_url } />
          </div>

          <div className="post-caption">
            { this.props.post.title }
          </div>

          <div className="post-footer">
            <div className="post-options">
              <button className="like-post-btn">
                <i className="fa fa-heart-o fa-2x" aria-hidden="true"></i>
              </button>
              <button className="edit-post-btn">
                <i className="fa fa-pencil-square-o fa-2x"
                  id="edit-btn-icon"
                  aria-hidden="true"></i>
              </button>
              <button className="delete-post-btn"
                onClick={ () => this.props.deletePost(this.props.post) } >
                <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
              </button>
            </div>
          </div>

        </div>
      </li>
    );
  }

  quote() {
    return (
      <li className="feed-item">
        <div className="post-quote">

          <div className="post-header">
            <div className="post-user">
              { this.props.post.author }
            </div>
          </div>

          <div className="post-content">
            <div className="quote">
              { this.props.post.title }
            </div>
            <div className="source">
              { this.props.post.body }
            </div>
          </div>

          <div className="post-footer">
            <div className="post-options">
              <button className="like-post-btn">
                <i className="fa fa-heart-o fa-2x" aria-hidden="true"></i>
              </button>
              <button className="edit-post-btn">
                <i className="fa fa-pencil-square-o fa-2x"
                  id="edit-btn-icon"
                  aria-hidden="true"></i>
              </button>
              <button className="delete-post-btn"
                onClick={ () => this.props.deletePost(this.props.post) } >
                <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
              </button>
            </div>
          </div>

        </div>
      </li>
    );
  }

  text() {
    return (
      <li className="feed-item">
        <div className="post-text">

          <div className="post-header">
            <div className="post-user">
              { this.props.post.author }
            </div>
          </div>

          <div className="post-content">
            <div className="post-title">
              { this.props.post.title }
            </div>
            <div className="post-body">
              { this.props.post.body }
            </div>
          </div>

          <div className="post-footer">
            <div className="post-options">
              <button className="like-post-btn">
                <i className="fa fa-heart-o fa-2x" aria-hidden="true"></i>
              </button>
              <button className="edit-post-btn">
                <i className="fa fa-pencil-square-o fa-2x"
                  id="edit-btn-icon"
                  aria-hidden="true"></i>
              </button>
              <button className="delete-post-btn"
                onClick={ () => this.props.deletePost(this.props.post) } >
                <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
              </button>
            </div>
          </div>

        </div>
      </li>
    );
  }

  video() {
    return (
      <li className="feed-item">
        <div className="post-video">

          <div className="post-header">
            <div className="post-user">
              { this.props.post.author }
            </div>
          </div>

          <div className="post-upload-video">
            <video width="540" height="440" controls>
              <source src={ this.props.post.image_url } />
            </video>
          </div>

          <div className="post-caption">
            { this.props.post.title }
          </div>

          <div className="post-footer">
            <div className="post-options">
              <button className="like-post-btn">
                <i className="fa fa-heart-o fa-2x" aria-hidden="true"></i>
              </button>
              <button className="edit-post-btn">
                <i className="fa fa-pencil-square-o fa-2x"
                  id="edit-btn-icon"
                  aria-hidden="true"></i>
              </button>
              <button className="delete-post-btn"
                onClick={ () => this.props.deletePost(this.props.post) } >
                <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
              </button>
            </div>
          </div>

        </div>
      </li>
    );
  }

  render() {
    switch (this.props.post.post_type) {
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
