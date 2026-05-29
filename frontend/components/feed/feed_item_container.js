import React from 'react';

import FeedItem from './feed_item';
import { useCurrentUser } from '../../query/session_hooks';
import { useDeletePost,
         useLikePost,
         useUnlikePost } from '../../query/post_hooks';
import { useFollowUser,
         useUnfollowUser } from '../../query/user_hooks';

const FeedItemContainer = props => {
  const currentUser = useCurrentUser();
  const deletePost = useDeletePost();
  const followUser = useFollowUser();
  const likePost = useLikePost();
  const unfollowUser = useUnfollowUser();
  const unlikePost = useUnlikePost();

  const handleDeletePost = post => (
    deletePost.mutate(post)
  );

  const handleFollowUser = id => (
    followUser.mutate(id)
  );

  const handleUnfollowUser = id => (
    unfollowUser.mutate(id)
  );

  const handleLikePost = id => (
    likePost.mutate(id)
  );

  const handleUnlikePost = id => (
    unlikePost.mutate(id)
  );

  return (
    <FeedItem
      {...props}
      currentUser={ currentUser.data }
      deletePost={ handleDeletePost }
      followUser={ handleFollowUser }
      likePost={ handleLikePost }
      unfollowUser={ handleUnfollowUser }
      unlikePost={ handleUnlikePost }
    />
  );
};

export default FeedItemContainer;
