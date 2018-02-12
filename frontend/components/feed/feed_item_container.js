import { connect } from 'react-redux';

import FeedItem from './feed_item';
import { selectAllPosts } from '../../reducers/selectors';
import { likePost,
         unlikePost,
         updatePost,
         deletePost } from '../../actions/posts_actions';
import { followUser,
         unfollowUser } from '../../actions/users_actions';
import { createComment,
         editComment,
         deleteComment } from '../../actions/comments_actions';
         

const mapStateToProps = state => ({
    currentUser: state.session.currentUser
});

const mapDispatchToProps = dispatch => ({
  deletePost: post => dispatch(deletePost(post)),
  followUser: id => dispatch(followUser(id)),
  unfollowUser: id => dispatch(unfollowUser(id)),
  likePost: id => dispatch(likePost(id)),
  unlikePost: id => dispatch(unlikePost(id)),
  createComment: comment => dispatch(createComment(comment)),
  editComment: comment => dispatch(editComment(comment)),
  deleteComment: comment => dispatch(deleteComment(comment))
});

const FeedItemContainer = connect(
  mapStateToProps, mapDispatchToProps
)(FeedItem);

export default FeedItemContainer;
