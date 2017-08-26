import { connect} from 'react-redux';

import { createMediaPost } from '../../actions/posts_actions';
import { clearErrors } from '../../actions/errors_actions';
import VideoForm from './video_form';

const mapStateToProps = ({ session, errors }) => ({
  currentUser: session.currentUser,
  errors: errors
});

const mapDispatchToProps = dispatch => ({
  createMediaPost: post => dispatch(createMediaPost(post)),
  clearErrors: () => dispatch(clearErrors())
});

const VideoFormContainer = connect(
  mapStateToProps, mapDispatchToProps
)(VideoForm);

export default VideoFormContainer;
