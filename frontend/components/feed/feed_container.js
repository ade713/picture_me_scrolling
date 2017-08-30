import { connect } from 'react-redux';

import Feed from './feed';
import { selectAllPosts } from '../../reducers/selectors';
import { requestAllPosts } from '../../actions/posts_actions';


const mapStateToProps = state => ({
  posts: selectAllPosts(state)
});

const mapDispatchToProps = dispatch => ({
  requestAllPosts: () => dispatch(requestAllPosts())
});

const FeedContainer = connect(
  mapStateToProps, mapDispatchToProps
)(Feed);

export default FeedContainer;
