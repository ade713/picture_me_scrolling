import { connect } from 'react-redux';

import PostBar from './post_bar';

const mapStateToProps = ({ session }) => ({
  currentUser: session.currentUser
});

const PostBarContainer = connect(
  mapStateToProps
)(PostBar);

export default PostBarContainer;
