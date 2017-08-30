import { connect } from 'react-redux';

import Feed from './feed';
import { selectAllPosts } from '../../reducers/selectors';
import { requestAllPosts,
         likePost,
         unlikePost,
         updatePost,
         deletePost } from '../../actions/posts_actions';
import { followUser,
         unfollowUser } from '../../actions/users_actions';


const mapStateToProps = state => ({
  posts: selectAllPosts(state),
  currentUser: state.session.currentUser,
});

const mapDispatchToProps = dispatch => ({
  requestAllPosts: () => dispatch(requestAllPosts()),
  deletePost: post => dispatch(deletePost(post)),
  followUser: id => dispatch(followUser(id)),
  unfollowUser: id => dispatch(unfollowUser(id)),
  likePost: id => dispatch(likePost(id)),
  unlikePost: id => dispatch(unlikePost(id)),
});

const FeedContainer = connect(
  mapStateToProps, mapDispatchToProps
)(Feed);

export default FeedContainer;
