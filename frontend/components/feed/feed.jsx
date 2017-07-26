import React from 'react';

import FeedItem from './feed_item';
import PostBarContainer from '../posts/post_bar_container';


class Feed extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.requestAllPosts();
  }

  render() {
    const { posts, deletePost, currentUser } = this.props;
    const feedItems = posts.map((post, index) =>
      <FeedItem key={ post.id } deletePost={ deletePost } post= { post } currentUser={ currentUser } />
    );

    return (
      <div className="feed-posts">
        <div className="new-post-container">
          <PostBarContainer />
        </div>
        <br />
        <ul>
          { feedItems }
        </ul>
      </div>
    );
  }
}

export default Feed;
