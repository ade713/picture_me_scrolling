import { connect} from 'react-redux';

import { createPost,
         createMediaPost } from '../../actions/posts_actions';
import QuoteForm from './quote_form';

const mapStateToProps = ({ session, errors }) => ({
  currentUser: session.currentUser,
  errors: errors
});

const mapDispatchToProps = dispatch => ({
  createPost: post => dispatch(createPost(post)),
});

const QuoteFormContainer = connect(
  mapStateToProps, mapDispatchToProps
)(QuoteForm);

export default QuoteFormContainer;
