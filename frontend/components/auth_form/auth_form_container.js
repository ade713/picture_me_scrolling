import React from 'react';
import { useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { receiveCurrentUser } from '../../actions/session_actions';
import { useCurrentUser, useLogin, useSignup } from '../../query/session_hooks';
import AuthForm from './auth_form';

const mutationErrors = mutation => (
  mutation.error ? mutation.error.errors : []
);

const authErrors = (...mutations) => (
  mutations.flatMap(mutationErrors)
);

const AuthFormContainer = props => {
  const { location } = props;
  const dispatch = useDispatch();
  const currentUser = useCurrentUser();
  const login = useLogin();
  const signup = useSignup();
  const formAction = location.pathname.slice(1);
  const formMutation = formAction === 'signup' ? signup : login;

  const processForm = user => {
    formMutation.mutate(user, {
      onSuccess: userData => dispatch(receiveCurrentUser(userData))
    });
  };

  const loginGuest = user => {
    login.mutate(user, {
      onSuccess: userData => dispatch(receiveCurrentUser(userData))
    });
  };

  return (
    <AuthForm
      {...props}
      errors={ authErrors(formMutation, login) }
      formAction={ formAction }
      loggedIn={ Boolean(currentUser.data) }
      login={ loginGuest }
      processForm={ processForm }
    />
  );
};

export default withRouter(AuthFormContainer);
