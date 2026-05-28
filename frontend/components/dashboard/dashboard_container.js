import React from 'react';
import { useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { receiveCurrentUser } from '../../actions/session_actions';
import { useLogout } from '../../query/session_hooks';
import Dashboard from './dashboard';

const DashboardContainer = props => {
  const dispatch = useDispatch();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => dispatch(receiveCurrentUser(null))
    });
  };

  return (
    <Dashboard
      {...props}
      logout={ handleLogout }
    />
  );
};

export default withRouter(DashboardContainer);
