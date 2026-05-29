import React from 'react';
import { Route,
         Redirect,
         withRouter } from 'react-router-dom';
import { useCurrentUser } from '../query/session_hooks';

const Auth = ({ component: Component, path, loggedIn }) => (
  <Route path={ path } render={ (props) => (
      !loggedIn ? (
        <Component {...props} />
      ) : (
        <Redirect to="/dashboard" />
      )
  )} />
);

const Protected = ({ component: Component, path, loggedIn }) => (
  <Route path={ path } render={ (props) => (
      loggedIn ? (
        <Component {...props} />
      ) : (
        <Redirect to="/" />
      )
    )} />
);

const withCurrentUser = RouteComponent => {
  const CurrentUserRoute = props => {
    const currentUser = useCurrentUser();

    return (
      <RouteComponent
        {...props}
        loggedIn={ Boolean(currentUser.data) }
      />
    );
  };

  return CurrentUserRoute;
};

export const AuthRoute = withRouter(
  withCurrentUser(Auth)
);

export const ProtectedRoute = withRouter(
  withCurrentUser(Protected)
);
