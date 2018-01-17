import { connect } from 'react-redux';

import RecommendedUsers from './recommended_users';
import { requestUsers,
         followUser } from '../../actions/users_actions';
import { selectUsers } from '../../reducers/selectors';
import { requestAllPosts } from '../../actions/posts_actions';


const mapStateToProps = state => ({
  users: selectUsers(state),
  currentUser: state.session.currentUser
});

const mapDispatchToProps = dispatch => ({
  requestPosts: () => dispatch(requestAllPosts()), 
  requestUsers: () => dispatch(requestUsers()),
  followUser: id => dispatch(followUser(id)) 
});

const RecommendedUsersContainer = connect(
  mapStateToProps, mapDispatchToProps
)(RecommendedUsers);

export default RecommendedUsersContainer;
