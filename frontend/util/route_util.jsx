import React from 'react';
import { Route,
         Redirect,
         withRouter } from 'react-router-dom';
import { useCurrentUser } from '../query/session_hooks';

export const AuthRoute = withRouter(({ component: Component, ...routeProps }) => {
  const currentUser = useCurrentUser();
  const loggedIn = Boolean(currentUser.data);

  return (
    <Route {...routeProps} render={ props => (
      !loggedIn ? (
        <Component {...props} />
      ) : (
        <Redirect to="/dashboard" />
      )
    )} />
  );
});

export const ProtectedRoute = withRouter(({ component: Component, ...routeProps }) => {
  const currentUser = useCurrentUser();
  const loggedIn = Boolean(currentUser.data);

  return (
    <Route {...routeProps} render={ props => (
      loggedIn ? (
        <Component {...props} />
      ) : (
        <Redirect to="/" />
      )
    )} />
  );
});
