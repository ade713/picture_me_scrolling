import React from 'react';

import { usePosts } from '../../query/post_hooks';
import FeedItem from './feed_item';
import PostBar from '../posts/post_bar';

const Feed = () => {
  const posts = usePosts();

  if (posts.isLoading) {
    return (
      <div className="feed-posts">
        <div className="new-post-container">
          <PostBar />
        </div>
        <ul className="feed-list"></ul>
      </div>
    );
  }

  if (posts.error) {
    return (
      <div className="feed-posts">
        <div className="new-post-container">
          <PostBar />
        </div>
        <ul className="feed-list">
          <li className="feed-post">
            Unable to load posts.
          </li>
        </ul>
      </div>
    );
  }

  const feedItems = (posts.data || []).map((post, index) =>
    <FeedItem
      key={ post.id }
      post={ post }
      priorityMedia={ index < 3 } />
  );

  return (
    <div className="feed-posts">
      <div className="new-post-container">
        <PostBar />
      </div>
      <ul className="feed-list">
        { feedItems }
      </ul>
    </div>
  );
};

export default Feed;
