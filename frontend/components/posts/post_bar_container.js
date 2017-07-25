import { connect } from 'react-redux';

import { createPost,
         createMediaPost } from '../../actions/posts_actions';
import PostBar from './post_bar';

const mapStateToProps = ({ session, errors }) => ({
  currentUser: session.currentUser,
  errors: errors
});

const mapDispatchToProps = dispatch => ({
  createPost: post => dispatch(createPost(post)),
  createMediaPost: post => dispatch(createMediaPost(post))
});

const PostBarContainer = connect(
  mapStateToProps, mapDispatchToProps
)(PostBar);

export default PostBarContainer;
