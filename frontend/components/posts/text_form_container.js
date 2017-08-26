import { connect} from 'react-redux';

import { createPost } from '../../actions/posts_actions';
import { clearErrors } from '../../actions/errors_actions';
import TextForm from './text_form';

const mapStateToProps = ({ session, errors }) => ({
  currentUser: session.currentUser,
  errors: errors
});

const mapDispatchToProps = dispatch => ({
  createPost: post => dispatch(createPost(post)),
  clearErrors: () => dispatch(clearErrors())
});

const TextFormContainer = connect(
  mapStateToProps, mapDispatchToProps
)(TextForm);

export default TextFormContainer;
