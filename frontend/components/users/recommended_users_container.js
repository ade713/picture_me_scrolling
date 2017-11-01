import { connect } from 'react-redux';

import RecommendedUsers from './recommended_users';
import { requestUsers,
         followUser } from '../../actions/users_actions';
import { selectUsers } from '../../reducers/selectors';


const mapStateToProps = state => ({
  users: selectUsers(state),
  currentUser: state.session.currentUser
});
// const mapStateToProps = state => {
//   console.log('test', state);
//   return {users: selectUsers(state)};
// };

const mapDispatchToProps = dispatch => ({
  requestUsers: () => dispatch(requestUsers()),
  followUser: id => dispatch(followUser(id)) 
});

const RecommendedUsersContainer = connect(
  mapStateToProps, mapDispatchToProps
)(RecommendedUsers);

export default RecommendedUsersContainer;