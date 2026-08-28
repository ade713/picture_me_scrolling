import React, { useCallback, useMemo } from 'react';

import { buttonLabels } from '../../config/button_labels';
import { PRIORITY_MEDIA_POST_COUNT } from '../../config/post_display';
import { routes } from '../../config/routes';
import { tagFilterMessages } from '../../config/tags';
import { profileMessages } from '../../config/user_profile';
import { useUserPosts } from '../../query/post_hooks';
import FeedItem from '../feed/feed_item';
import { PostTagNavigationProvider } from '../feed/post_tag_navigation_context';
import TagFilterHeader from '../feed/tag_filter_header';
import AutomaticPagination from '../pagination/automatic_pagination';
import PaginationLoadingIndicator, {
  loadingIndicatorVariants
} from '../pagination/pagination_loading_indicator';

const ProfilePosts = ({ profileId, tag }) => {
  const posts = useUserPosts(profileId, tag);
  const loadedPosts = posts.data?.posts;
  const tagDestination = useCallback(
    selectedTag => routes.userProfileTag(profileId, selectedTag),
    [profileId]
  );
  const postItems = useMemo(() => (loadedPosts || []).map((post, index) => (
    <FeedItem
      key={post.id}
      post={post}
      priorityMedia={index < PRIORITY_MEDIA_POST_COUNT}
    />
  )), [loadedPosts]);

  const renderPosts = () => {
    if (posts.isLoading) {
      return (
        <PaginationLoadingIndicator
          label={tagFilterMessages.loading}
          variant={loadingIndicatorVariants.initial}
        />
      );
    }

    if (posts.isError) {
      return (
        <p className="profile-view-state" role="alert">
          {tagFilterMessages.loadError}
        </p>
      );
    }

    return (
      <>
        <ul className="feed-list">
          {postItems.length > 0 ? postItems : (
            <li className="profile-view-state profile-empty-state">
              <h3>{tag ? tagFilterMessages.noPosts : profileMessages.noPosts}</h3>
            </li>
          )}
        </ul>

        <AutomaticPagination
          fallbackClassName="load-more-posts"
          fallbackLabel={buttonLabels.loadMorePosts}
          hasNextPage={posts.hasNextPage}
          isFetchingNextPage={posts.isFetchingNextPage}
          loadingLabel={buttonLabels.loadingMorePosts}
          onLoadNextPage={posts.fetchNextPage}
        />
      </>
    );
  };

  return (
    <section aria-label="Profile posts" className="profile-posts">
      <TagFilterHeader
        clearDestination={routes.userProfile(profileId)}
        tag={tag}
      />
      <PostTagNavigationProvider destination={tagDestination}>
        {renderPosts()}
      </PostTagNavigationProvider>
    </section>
  );
};

export default ProfilePosts;
