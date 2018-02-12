import { connect } from 'react-redux';

import Comments from './comments';

const mapDispatchToProps = dispatch => ({
  
});

const CommentsContainer = connect(
  null, mapDispatchToProps
)(Comments);

export default CommentsContainer;
