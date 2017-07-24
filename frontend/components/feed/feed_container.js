import { connect } from 'react-redux';

import Feed from './feed.jsx';
import { selectAllPosts } from '../../reducers/selectors';
import { requestAllPosts,
         deletePost } from '../../actions/posts_actions';

const mapStateToProps = state => ({
  posts: selectAllPosts(state)
});

const mapDispatchToProps = dispatch => ({
  requestAllPosts: () => dispatch(requestAllPosts()),
  deletePost: post => dispatch(deletePost(post))
});

const FeedContainer = connect(
  mapStateToProps, mapDispatchToProps
)(Feed);

export default FeedContainer;
