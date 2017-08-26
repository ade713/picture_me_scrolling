import { connect} from 'react-redux';

import { createMediaPost } from '../../actions/posts_actions';
import { clearErrors } from '../../actions/errors_actions';
import PhotoForm from './photo_form';

const mapStateToProps = ({ session, errors }) => ({
  currentUser: session.currentUser,
  errors: errors
});

const mapDispatchToProps = dispatch => ({
  createMediaPost: post => dispatch(createMediaPost(post)),
  clearErrors: () => dispatch(clearErrors())
});

const PhotoFormContainer = connect(
  mapStateToProps, mapDispatchToProps
)(PhotoForm);

export default PhotoFormContainer;
