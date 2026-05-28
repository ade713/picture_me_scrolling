import React from 'react';
import { connect, useDispatch } from 'react-redux';

import FeedItem from './feed_item';
import { receiveAllPosts,
         receivePost,
         removePost } from '../../actions/posts_actions';
import { useDeletePost,
         useLikePost,
         useUnlikePost } from '../../query/post_hooks';
import { useFollowUser,
         useUnfollowUser } from '../../query/user_hooks';


const mapStateToProps = state => ({
  currentUser: state.session.currentUser
});

const ConnectedFeedItem = connect(
  mapStateToProps
)(FeedItem);

const FeedItemContainer = props => {
  const dispatch = useDispatch();
  const deletePost = useDeletePost();
  const followUser = useFollowUser();
  const likePost = useLikePost();
  const unfollowUser = useUnfollowUser();
  const unlikePost = useUnlikePost();

  const handleDeletePost = post => (
    deletePost.mutate(post, {
      onSuccess: deletedPost => dispatch(removePost(deletedPost))
    })
  );

  const handleFollowUser = id => (
    followUser.mutate(id, {
      onSuccess: posts => dispatch(receiveAllPosts(posts))
    })
  );

  const handleUnfollowUser = id => (
    unfollowUser.mutate(id, {
      onSuccess: posts => dispatch(receiveAllPosts(posts))
    })
  );

  const handleLikePost = id => (
    likePost.mutate(id, {
      onSuccess: post => dispatch(receivePost(post))
    })
  );

  const handleUnlikePost = id => (
    unlikePost.mutate(id, {
      onSuccess: post => dispatch(receivePost(post))
    })
  );

  return (
    <ConnectedFeedItem
      {...props}
      deletePost={ handleDeletePost }
      followUser={ handleFollowUser }
      likePost={ handleLikePost }
      unfollowUser={ handleUnfollowUser }
      unlikePost={ handleUnlikePost }
    />
  );
};

export default FeedItemContainer;
