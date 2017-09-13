import { connect } from 'react-redux';

import RecommendedUsers from './recommended_users';
import { requestUsers,
         followUser } from '../../actions/users_actions';
import { selectUsers } from '../../reducers/selectors';


const mapStateToProps = state => ({
  users: selectUsers(state)
});

const mapDispatchToProps = dispatch => ({
  requestUsers: () => dispatch(requestUsers())
});

const RecommendedUsersContainer = connect(
  mapStateToProps, mapDispatchToProps
)(RecommendedUsers);

export default RecommendedUsers;