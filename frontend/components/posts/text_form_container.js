import { connect} from 'react-redux';

import { createPost,
         createMediaPost } from '../../actions/posts_actions';
import TextForm from './text_form';

const mapStateToProps = ({ session }) => ({
  currentUser: session.currentUser
});

const mapDispatchToProps = dispatch => ({
  createPost: post => dispatch(createPost(post)),
});

const TextFormContainer = connect(
  mapStateToProps, mapDispatchToProps
)(TextForm);

export default TextFormContainer;
