import React from 'react';

import FeedItem from './feed_item';
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

    const feedItems = posts.map((post, index) =>
      <FeedItem 
        key={ post.id }
        post={ post }
        deletePost={ deletePost }
        currentUser={ currentUser }
        followUser={ followUser }
        unfollowUser={ unfollowUser }
        likePost={ likePost }
        unlikePost={ unlikePost } />
    );

    console.log('rdr', this.state);
    
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
