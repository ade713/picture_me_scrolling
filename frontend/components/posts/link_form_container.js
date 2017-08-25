import { connect} from 'react-redux';

import { createPost,
         createMediaPost } from '../../actions/posts_actions';
import LinkForm from './link_form';

const mapStateToProps = ({ session, errors }) => ({
  currentUser: session.currentUser,
  errors: errors
});

const mapDispatchToProps = dispatch => ({
  createPost: post => dispatch(createPost(post)),
  createMediaPost: post => dispatch(createMediaPost(post))
});

const LinkFormContainer = connect(
  mapStateToProps, mapDispatchToProps
)(LinkForm);

export default LinkFormContainer;
