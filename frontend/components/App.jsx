import React from "react";
import { HashRouter, Switch } from "react-router-dom";

import DashboardContainer from "./dashboard/dashboard_container";
import AuthForm from "./auth_form/auth_form";
import { AuthRoute, ProtectedRoute } from "../util/route_util";

const App = () => (
  <HashRouter>
    <Switch>
      <ProtectedRoute exact path='/dashboard' component={DashboardContainer} />
      <AuthRoute exact path='/signup' component={AuthForm} />
      <AuthRoute exact path='/' component={AuthForm} />
    </Switch>
  </HashRouter>
);

export default App;
