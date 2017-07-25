import { connect} from 'react-redux';

import { createPost,
         createMediaPost } from '../../actions/posts_actions';
import PhotoForm from './photo_form';

const mapStateToProps = ({ session }) => ({
  currentUser: session.currentUser
});

const mapDispatchToProps = dispatch => ({
  createMediaPost: post => dispatch(createMediaPost(post))
});

const PhotoFormContainer = connect(
  mapStateToProps, mapDispatchToProps
)(PhotoForm);

export default PhotoFormContainer;
