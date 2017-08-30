import React from 'react';

import FeedItem from './feed_item';
import FeedItemContainer from './feed_item_container';
import PostBarContainer from '../posts/post_bar_container';

class Feed extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.requestAllPosts();
  }

  render() {
    const {
        posts, 
        deletePost, 
        likePost, 
        unlikePost, 
        currentUser,
        followUser,
        unfollowUser, 
        users
      } = this.props;

    const feedItems = posts.map(post =>
      <FeedItemContainer 
        key={ post.id }
        post={ post }
        />
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

// deletePost={ deletePost }
// currentUser={ currentUser }
// followUser={ followUser }
// unfollowUser={ unfollowUser }
// likePost={ likePost }
// unlikePost={ unlikePost } 