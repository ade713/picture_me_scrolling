import React, { useMemo } from 'react';

import { buttonLabels } from '../../config/button_labels';
import { usePosts } from '../../query/post_hooks';
import FeedItem from './feed_item';
import PostBar from '../posts/post_bar';

const PRIORITY_MEDIA_POST_COUNT = 3;

const Feed = ({ tag }) => {
  const posts = usePosts(tag);
  const loadedPosts = posts.data?.posts;
  const feedItems = useMemo(() => (loadedPosts || []).map((post, index) =>
    <FeedItem
      key={ post.id }
      post={ post }
      priorityMedia={ index < PRIORITY_MEDIA_POST_COUNT } />
  ), [loadedPosts]);

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

  return (
    <div className="feed-posts">
      <div className="new-post-container">
        <PostBar />
      </div>
      <ul className="feed-list">
        { feedItems }
      </ul>
      { posts.hasNextPage && (
        <button
          className="load-more-posts"
          disabled={ posts.isFetchingNextPage }
          onClick={ () => posts.fetchNextPage() }>
          { posts.isFetchingNextPage ? buttonLabels.loadingPosts : buttonLabels.loadMorePosts }
        </button>
      ) }
    </div>
  );
};

export default Feed;
