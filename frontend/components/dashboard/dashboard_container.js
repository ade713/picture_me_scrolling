import React from 'react';
import { withRouter } from 'react-router-dom';

import { useLogout } from '../../query/session_hooks';
import Dashboard from './dashboard';

const DashboardContainer = props => {
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <Dashboard
      {...props}
      logout={ handleLogout }
    />
  );
};

export default withRouter(DashboardContainer);
