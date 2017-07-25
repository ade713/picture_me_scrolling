import { connect} from 'react-redux';

import { createPost,
         createMediaPost } from '../../actions/posts_actions';
import VideoForm from './video_form';

const mapStateToProps = ({ session }) => ({
  currentUser: session.currentUser
});

const mapDispatchToProps = dispatch => ({
  createPost: post => dispatch(createPost(post)),
  createMediaPost: post => dispatch(createMediaPost(post))
});

const VideoFormContainer = connect(
  mapStateToProps, mapDispatchToProps
)(VideoForm);

export default VideoFormContainer;
