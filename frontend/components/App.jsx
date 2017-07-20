import React from 'react';
import { HashRouter,
         Route,
         Switch } from 'react-router-dom';

import DashboardContainer from './dashboard/dashboard_container';
import AuthFormContainer from './auth_form/auth_form_container';

const App = () => (
  <HashRouter>
    <Switch>
      <Route exact path="/dashboard" component={ DashboardContainer } />
      <Route exact path="/signup" component={ AuthFormContainer }/>
      <Route exact path="/" component={ AuthFormContainer } />
    </Switch>
  </HashRouter>
);

export default App;
