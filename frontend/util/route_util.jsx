import React from 'react';
import { Navigate } from 'react-router-dom';
import { routes } from '../config/routes';
import { useCurrentUser } from '../query/session_hooks';

export const AuthRoute = ({ children }) => {
  const currentUser = useCurrentUser();
  const loggedIn = Boolean(currentUser.data);

  return !loggedIn ? (
    children
  ) : (
    <Navigate to={ routes.dashboard } replace />
  );
};

export const ProtectedRoute = ({ children }) => {
  const currentUser = useCurrentUser();
  const loggedIn = Boolean(currentUser.data);

  return loggedIn ? (
    children
  ) : (
    <Navigate to={ routes.home } replace />
  );
};
