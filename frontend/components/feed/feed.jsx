import React from 'react';

import FeedItem from './feed_item';
import PostBarContainer from '../posts/post_bar_container';

class Feed extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      looading: true
    };
    console.log('state', this.state);
  }

  componentDidMount() {
    setTimeout(() => this.setState({
      loading: false
    }), 5000);
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
    if (this.state.loading) {
      return (
        <div className="sk-folding-cube">
          <div className="sk-cube1 sk-cube"></div>
          <div className="sk-cube2 sk-cube"></div>
          <div className="sk-cube4 sk-cube"></div>
          <div className="sk-cube3 sk-cube"></div>
        </div>
      );
    } else {
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
}

export default Feed;
