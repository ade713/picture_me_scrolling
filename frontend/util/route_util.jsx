import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../query/session_hooks';

export const AuthRoute = ({ children }) => {
  const currentUser = useCurrentUser();
  const loggedIn = Boolean(currentUser.data);

  return !loggedIn ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

export const ProtectedRoute = ({ children }) => {
  const currentUser = useCurrentUser();
  const loggedIn = Boolean(currentUser.data);

  return loggedIn ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
};
