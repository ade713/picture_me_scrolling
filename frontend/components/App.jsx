import React from 'react';
import { HashRouter,
         Route,
         Switch,
         wtihRouter } from 'react-router-dom';

import DashboardContainer from './dashboard/dashboard_container';
import AuthFormContainer from './auth_form/auth_form_container';
import { AuthRoute, ProtectedRoute } from '../util/route_util';

const App = () => (
  <HashRouter>
    <Switch>
      <ProtectedRoute exact path="/dashboard" component={ DashboardContainer } />
      <AuthRoute exact path="/signup" component={ AuthFormContainer }/>
      <AuthRoute exact path="/" component={ AuthFormContainer } />
    </Switch>
  </HashRouter>
);

export default App;
