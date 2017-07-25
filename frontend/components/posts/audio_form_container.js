import { connect} from 'react-redux';

import { createPost,
         createMediaPost } from '../../actions/posts_actions';
import AudioForm from './audio_form';

const mapStateToProps = ({ session }) => ({
  currentUser: session.currentUser
});

const mapDispatchToProps = dispatch => ({
  createMediaPost: post => dispatch(createMediaPost(post))
});

const AudioFormContainer = connect(
  mapStateToProps, mapDispatchToProps
)(AudioForm);

export default AudioFormContainer;
