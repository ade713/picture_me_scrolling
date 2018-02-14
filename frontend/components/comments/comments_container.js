import { connect } from 'react-redux';

import Comments from './comments';
import { createComment,
         editComment, 
         deleteComment } from '../../actions/comments_actions';

const mapStateToProps = ({ session, errors }) => ({
  currentUser: session.currentUser,
  errors: errors
});

const mapDispatchToProps = dispatch => ({
  createComment: comment => dispatch(createComment(comment)),
  editComment: comment => dispatch(editComment(comment)),
  deleteComment: comment => dispatch(deleteComment(comment))
});

const CommentsContainer = connect(
  mapStateToProps, mapDispatchToProps
)(Comments);

export default CommentsContainer;
