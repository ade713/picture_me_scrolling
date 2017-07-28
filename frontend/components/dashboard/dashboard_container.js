import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { logout } from '../../actions/session_actions';
import Dashboard from './dashboard';

const mapStateToProps = ({ session }) => ({
  currentUser: session.currentUser
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout())
});

const DashboardContainer = connect(
  mapStateToProps, mapDispatchToProps
)(Dashboard);

export default withRouter(DashboardContainer);
