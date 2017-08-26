import { connect} from 'react-redux';

import { createPost } from '../../actions/posts_actions';
import { clearErrors } from '../../actions/errors_actions';
import LinkForm from './link_form';

const mapStateToProps = ({ session, errors }) => ({
  currentUser: session.currentUser,
  errors: errors
});

const mapDispatchToProps = dispatch => ({
  createPost: post => dispatch(createPost(post)),
  clearErrors: () => dispatch(clearErrors())
});

const LinkFormContainer = connect(
  mapStateToProps, mapDispatchToProps
)(LinkForm);

export default LinkFormContainer;
