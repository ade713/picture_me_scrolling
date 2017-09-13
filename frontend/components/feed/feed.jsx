import React from 'react';

import FeedItemContainer from './feed_item_container';
import PostBarContainer from '../posts/post_bar_container';

class Feed extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    this.props.requestAllPosts();
  }

  render() {
    const { posts } = this.props;
    console.log('all', posts);
    const feedItems = posts.map(post =>
      <FeedItemContainer
        key={ post.id }
        post={ post } />
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
