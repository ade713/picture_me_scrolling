import React from 'react';
import { withRouter } from 'react-router';

class FeedItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { post, deletePost, currentUser } = this.props;

    return (
      <li className="feed-item">
        <div className="post-user">
          { post.author }
        </div>
        <div>
          { post.title }
          <br />
          { post.body }
        </div>
      </li>
    );
  }
}

export default FeedItem;
