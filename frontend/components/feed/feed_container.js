import React from 'react';

import Feed from './feed';
import { usePosts } from '../../query/post_hooks';

const FeedContainer = props => {
  const posts = usePosts();

  return (
    <Feed
      {...props}
      posts={ posts.data || [] }
      postsError={ posts.error }
      postsLoading={ posts.isLoading }
    />
  );
};

export default FeedContainer;
