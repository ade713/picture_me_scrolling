import React from 'react';
import { withRouter } from 'react-router';

class FeedItem extends React.Component {
  constructor(props) {
    super(props);


  }

  audio() {

  }

  link() {

  }

  photo() {

  }

  quote() {

  }

  text() {

  }

  video() {

  }


  render() {
    const { post, deletePost, currentUser } = this.props;

    return (
      <li className="feed-item">
        <div className="post-user">
          { post.author_id }
        </div>

        <div>
          { post.title }
          <br />
          { post.body }
          <br />

        </div>

        <img className="post-upload"
          src={ post.image_url } />

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
              onClick={ () => deletePost(post) } >
              <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </li>
    );
  }
}

export default FeedItem;
