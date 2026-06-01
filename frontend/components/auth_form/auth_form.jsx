import React, { useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { useCurrentUser, useLogin, useSignup } from '../../query/session_hooks';
import useGuestLogin from './use_guest_login';

const mutationErrors = mutation => (
  mutation.error ? mutation.error.errors : []
);

const authErrors = (...mutations) => (
  mutations.flatMap(mutationErrors)
);

const AuthForm = () => {
  const currentUser = useCurrentUser();
  const history = useHistory();
  const location = useLocation();
  const login = useLogin();
  const signup = useSignup();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const logInAsGuest = useGuestLogin({ login, setUsername, setPassword });
  const formAction = location.pathname.slice(1);
  const formMutation = formAction === 'signup' ? signup : login;
  const errors = authErrors(formMutation, login);
  const loggedIn = Boolean(currentUser.data);

  useEffect(() => {
    if (loggedIn) {
      history.push('/dashboard');
    }
  }, [history, loggedIn]);

  const handleSubmit = e => {
    e.preventDefault();
    formMutation.mutate({ username, password });
  };

  const navLink = () => (
    formAction === 'signup' ? <Link to="/">Log In</Link> : <Link to="/signup">Sign Up</Link>
  );

  const authSubmitType = () => (
    formAction === 'signup' ? 'Sign Up' : 'Log In'
  );

  const renderErrors = () => (
    <ul>
      { errors.map((error, index) => (
        <li key={ `error-${index}` }>
          { error }
        </li>
      )) }
    </ul>
  );

  return (
    <div className="auth-page">
      <div className="auth-main">
        <header className="auth-navbar">
          <div className="auth-header">
            Picture Me Scrolling
          </div>
          <div className="login-signup">
            { navLink() }
          </div>
        </header>
        <div className="auth-body">
          <section className="auth-page-description">
            <h1 className="auth-desc-top">"All for One and One for All"</h1>
            <h1 className="auth-desc-mid1">View the world of others in one spot!</h1>
            <h1 className="auth-desc-mid2">Share your world to all!</h1>
            <h1 className="auth-desc-btm">Express yourself through words, photos, audio &amp; video.</h1>
          </section>
          <section className="auth-form-box">
            <h1 className="auth-form-header">
              Let's Begin
            </h1>
            <br />
            <br />
            <label className="auth-username">
              <input
                type="text"
                value={ username }
                placeholder="Your Username"
                onChange={ e => setUsername(e.currentTarget.value) }
                className="auth-login-input" />
            </label>
            <br />
            <label className="auth-password">
              <input
                type="password"
                value={ password }
                placeholder="Your Password"
                onChange={ e => setPassword(e.currentTarget.value) }
                className="auth-login-input" />
            </label>
            <br />
            <Link
              to="/dashboard"
              className="auth-submit"
              onClick={ handleSubmit }>
              { authSubmitType() }
            </Link>
            <Link
              to="/dashboard"
              className="guest-login"
              onClick={ logInAsGuest }>
              Guest Log In
            </Link>
            <br />
            <strong className="auth-errors">
              { renderErrors() }
            </strong>
          </section>
        </div>
      </div>
      <footer className="auth-footer">
        <a
          href="https://github.com/ade713"
          target="_blank"
          rel="noopener noreferrer">
          <i className="fa fa-github fa-2x" aria-hidden="true"></i>
        </a>
        <a
          href="https://www.linkedin.com/in/ade-farquhar-2a66a233"
          target="_blank"
          rel="noopener noreferrer">
          <i className="fa fa-linkedin-square fa-2x" aria-hidden="true"></i>
        </a>
      </footer>
    </div>
  );
};

export default AuthForm;
