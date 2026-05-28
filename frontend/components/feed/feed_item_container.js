import React from 'react';
import { connect, useDispatch } from 'react-redux';

import FeedItem from './feed_item';
import { likePost,
         unlikePost,
         removePost } from '../../actions/posts_actions';
import { followUser,
         unfollowUser } from '../../actions/users_actions';
import { useDeletePost } from '../../query/post_hooks';
         

const mapStateToProps = state => ({
    currentUser: state.session.currentUser
});

const mapDispatchToProps = dispatch => ({
  followUser: id => dispatch(followUser(id)),
  unfollowUser: id => dispatch(unfollowUser(id)),
  likePost: id => dispatch(likePost(id)),
  unlikePost: id => dispatch(unlikePost(id)),
});

const ConnectedFeedItem = connect(
  mapStateToProps, mapDispatchToProps
)(FeedItem);

const FeedItemContainer = props => {
  const dispatch = useDispatch();
  const deletePost = useDeletePost();

  const handleDeletePost = post => (
    deletePost.mutate(post, {
      onSuccess: deletedPost => dispatch(removePost(deletedPost))
    })
  );

  return (
    <ConnectedFeedItem
      {...props}
      deletePost={ handleDeletePost }
    />
  );
};

export default FeedItemContainer;
