import React, { useMemo } from 'react';

import { buttonLabels } from '../../config/button_labels';
import { PRIORITY_MEDIA_POST_COUNT } from '../../config/post_display';
import { routes } from '../../config/routes';
import { tagFilterMessages } from '../../config/tags';
import { usePosts } from '../../query/post_hooks';
import AutomaticPagination from '../pagination/automatic_pagination';
import LoadingIndicator, {
  loadingIndicatorVariants
} from '../loading/loading_indicator';
import FeedItem from './feed_item';
import TagFilterHeader from './tag_filter_header';
import PostBar from '../posts/post_bar';

const Feed = ({ shouldFocusHeading = true, tag }) => {
  const posts = usePosts(tag);
  const loadedPosts = posts.data?.posts;
  const feedItems = useMemo(() => (loadedPosts || []).map((post, index) =>
    <FeedItem
      key={ post.id }
      post={ post }
      priorityMedia={ index < PRIORITY_MEDIA_POST_COUNT } />
  ), [loadedPosts]);

  const renderFeedContent = () => {
    if (posts.isLoading) {
      return (
        <LoadingIndicator
          label={tagFilterMessages.loading}
          variant={loadingIndicatorVariants.large}
        />
      );
    }

    if (posts.error && !posts.isFetchNextPageError) {
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
        <AutomaticPagination
          fallbackClassName="load-more-posts"
          fallbackLabel={buttonLabels.loadMorePosts}
          hasNextPage={posts.hasNextPage}
          isFetchingNextPage={posts.isFetchingNextPage}
          loadingLabel={buttonLabels.loadingMorePosts}
          isNextPageError={posts.isFetchNextPageError}
          onLoadNextPage={posts.fetchNextPage}
          retryLabel={buttonLabels.retryLoading}
        />
      </>
    );
  };

  return (
    <div className="feed-posts">
      <div className="new-post-container">
        <PostBar />
      </div>
      <TagFilterHeader
        clearDestination={routes.dashboard}
        shouldFocusHeading={shouldFocusHeading}
        tag={tag}
      />
      {renderFeedContent()}
    </div>
  );
};

export default Feed;
