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

        <button className="delete-post-btn"
                onClick={ () => deletePost(post) } >
          <i className="fa fa-trash fa-lg" aria-hidden="true"></i>
        </button>
      </li>
    );
  }
}

export default FeedItem;
