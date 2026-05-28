import React from 'react';

import { useCurrentUser } from '../../query/session_hooks';
import PostBar from './post_bar';

const PostBarContainer = props => {
  const currentUser = useCurrentUser();

  return (
    <PostBar
      {...props}
      currentUser={ currentUser.data }
    />
  );
};

export default PostBarContainer;
