import React from 'react';

import FeedItemContainer from './feed_item_container';
import PostBarContainer from '../posts/post_bar_container';

const Feed = ({ posts, postsError, postsLoading }) => {
  if (postsLoading) {
    return (
      <div className="feed-posts">
        <div className="new-post-container">
          <PostBarContainer />
        </div>
        <br />
        <ul className="feed-list"></ul>
      </div>
    );
  }

  if (postsError) {
    return (
      <div className="feed-posts">
        <div className="new-post-container">
          <PostBarContainer />
        </div>
        <br />
        <ul className="feed-list">
          <li className="feed-post">
            Unable to load posts.
          </li>
        </ul>
      </div>
    );
  }

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
      <ul className="feed-list">
        { feedItems }
      </ul>
    </div>
  );
};

export default Feed;
