import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const GUEST_USER = {
  username: 'PicMeS Guest',
  password: '1Welcome2To3PicMeS'
};

const AuthForm = ({
  errors,
  formAction,
  history,
  loggedIn,
  login,
  processForm
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const guestLoginTimers = useRef([]);

  useEffect(() => {
    if (loggedIn) {
      history.push('/dashboard');
    }
  }, [history, loggedIn]);

  useEffect(() => (
    () => {
      guestLoginTimers.current.forEach(clearTimeout);
    }
  ), []);

  const clearGuestLoginTimers = () => {
    guestLoginTimers.current.forEach(clearTimeout);
    guestLoginTimers.current = [];
  };

  const queueGuestLoginTimer = (callback, delay) => {
    const timerId = setTimeout(callback, delay);
    guestLoginTimers.current.push(timerId);
  };

  const handleSubmit = e => {
    e.preventDefault();
    processForm({ username, password });
  };

  const logInAsGuest = e => {
    e.preventDefault();
    clearGuestLoginTimers();

    for (let i = 0; i < GUEST_USER.username.length; i++) {
      queueGuestLoginTimer(
        () => setUsername(GUEST_USER.username.slice(0, i + 1)),
        i * 75
      );
    }

    for (let i = 0; i < GUEST_USER.password.length; i++) {
      queueGuestLoginTimer(
        () => setPassword(GUEST_USER.password.slice(0, i + 1)),
        (i + GUEST_USER.username.length) * 75
      );
    }

    queueGuestLoginTimer(() => login(GUEST_USER), 1700);
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
        <a href="https://github.com/ade713" target="_blank">
          <i className="fa fa-github fa-2x" aria-hidden="true"></i>
        </a>
        <a href="https://www.linkedin.com/in/ade-farquhar-2a66a233" target="_blank">
          <i className="fa fa-linkedin-square fa-2x" aria-hidden="true"></i>
        </a>
      </footer>
    </div>
  );
};

export default AuthForm;
