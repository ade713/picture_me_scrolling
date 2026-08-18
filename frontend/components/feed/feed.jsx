import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

import { buttonLabels } from '../../config/button_labels';
import { PRIORITY_MEDIA_POST_COUNT } from '../../config/post_display';
import { routes } from '../../config/routes';
import { tagFilterMessages } from '../../config/tags';
import { usePosts } from '../../query/post_hooks';
import FeedItem from './feed_item';
import PostBar from '../posts/post_bar';

const Feed = ({ tag }) => {
  const posts = usePosts(tag);
  const headingRef = useRef(null);
  const previousTag = useRef(undefined);
  const loadedPosts = posts.data?.posts;
  const feedItems = useMemo(() => (loadedPosts || []).map((post, index) =>
    <FeedItem
      key={ post.id }
      post={ post }
      priorityMedia={ index < PRIORITY_MEDIA_POST_COUNT } />
  ), [loadedPosts]);

  useEffect(() => {
    const filterChanged = previousTag.current !== tag;
    const shouldAnnounce = Boolean(tag) || Boolean(previousTag.current);

    if (filterChanged && shouldAnnounce) {
      headingRef.current?.focus();
      headingRef.current?.scrollIntoView?.({ block: 'start' });
    }

    previousTag.current = tag;
  }, [tag]);

  const feedHeader = (
    <header className="feed-filter-header">
      <h2 ref={headingRef} tabIndex="-1">
        {tagFilterMessages.heading(tag)}
      </h2>
      {tag && (
        <Link
          aria-label={tagFilterMessages.clearLabel}
          className="clear-tag-filter"
          title={tagFilterMessages.clearLabel}
          to={routes.dashboard}>
          <span aria-hidden="true">×</span> {tagFilterMessages.clear}
        </Link>
      )}
    </header>
  );

  const renderFeedContent = () => {
    if (posts.isLoading) {
      return (
        <p className="feed-status" role="status">{tagFilterMessages.loading}</p>
      );
    }

    if (posts.error) {
      return (
        <div className="feed-state" role="alert">
          <p>{tagFilterMessages.loadError}</p>
          <button onClick={() => posts.refetch()} type="button">
            {buttonLabels.retry}
          </button>
        </div>
      );
    }

    return (
      <>
        <ul className="feed-list">
          {feedItems.length > 0 ? feedItems : (
            <li className="feed-state feed-empty-state">
              <h3>{tagFilterMessages.noPosts}</h3>
            </li>
          )}
        </ul>
        {posts.hasNextPage && (
          <button
            className="load-more-posts"
            disabled={posts.isFetchingNextPage}
            onClick={() => posts.fetchNextPage()}>
            {posts.isFetchingNextPage
              ? buttonLabels.loadingPosts
              : buttonLabels.loadMorePosts}
          </button>
        )}
      </>
    );
  };

  return (
    <div className="feed-posts">
      <div className="new-post-container">
        <PostBar />
      </div>
      {feedHeader}
      {renderFeedContent()}
    </div>
  );
};

export default Feed;
