import React, { useMemo } from 'react';

import { buttonLabels } from '../../config/button_labels';
import { PRIORITY_MEDIA_POST_COUNT } from '../../config/post_display';
import { profileMessages } from '../../config/user_profile';
import { useUserPosts } from '../../query/post_hooks';
import FeedItem from '../feed/feed_item';

const ProfilePosts = ({ profileId }) => {
  const posts = useUserPosts(profileId);
  const loadedPosts = posts.data?.posts;
  const postItems = useMemo(() => (loadedPosts || []).map((post, index) => (
    <FeedItem
      key={post.id}
      post={post}
      priorityMedia={index < PRIORITY_MEDIA_POST_COUNT}
    />
  )), [loadedPosts]);

  if (posts.isLoading) {
    return (
      <p className="profile-view-state" role="status">
        {profileMessages.postsLoading}
      </p>
    );
  }

  if (posts.isError) {
    return (
      <p className="profile-view-state" role="alert">
        {profileMessages.postsLoadError}
      </p>
    );
  }

  return (
    <section aria-label="Profile posts" className="profile-posts">
      <ul className="feed-list">
        {postItems.length > 0 ? postItems : (
          <li className="profile-view-state profile-empty-state">
            <h2>{profileMessages.noPosts}</h2>
          </li>
        )}
      </ul>

      {posts.hasNextPage && (
        <button
          className="load-more-posts"
          disabled={posts.isFetchingNextPage}
          onClick={() => posts.fetchNextPage()}
          type="button"
        >
          {posts.isFetchingNextPage
            ? buttonLabels.loadingPosts
            : buttonLabels.loadMorePosts}
        </button>
      )}
    </section>
  );
};

export default ProfilePosts;
