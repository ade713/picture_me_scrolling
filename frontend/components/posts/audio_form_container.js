import { connect} from 'react-redux';

import { createPost,
         createMediaPost } from '../../actions/posts_actions';
import { clearErrors } from '../../actions/errors_actions';
import AudioForm from './audio_form';

const mapStateToProps = ({ session, errors }) => ({
  currentUser: session.currentUser,
  errors: errors
});

const mapDispatchToProps = dispatch => ({
  createMediaPost: post => dispatch(createMediaPost(post)),
  clearErrors: () => dispatch(clearErrors())
});

const AudioFormContainer = connect(
  mapStateToProps, mapDispatchToProps
)(AudioForm);

export default AudioFormContainer;
