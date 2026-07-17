import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useCurrentUser, useLogin, useSignup } from "../../query/session_hooks";
import useGuestLogin from "./use_guest_login";

const mutationErrors = (mutation) => (mutation.error ? mutation.error.errors : []);

const authErrors = (...mutations) => (
  [...new Set(mutations.flatMap(mutationErrors))]
);

const AuthForm = () => {
  const currentUser = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const login = useLogin();
  const signup = useSignup();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const logInAsGuest = useGuestLogin({ login, setUsername, setPassword });

  const isSignup = location.pathname === "/signup";
  const formMutation = isSignup ? signup : login;
  const navTarget = isSignup ? "/" : "/signup";
  const navText = isSignup ? "Log In" : "Sign Up";
  const submitText = isSignup ? "Sign Up" : "Log In";
  const errors = isSignup ? authErrors(signup, login) : authErrors(login);
  const loggedIn = Boolean(currentUser.data);

  useEffect(() => {
    if (loggedIn) {
      navigate("/dashboard");
    }
  }, [loggedIn, navigate]);

  useEffect(() => {
    login.reset();
    signup.reset();
  }, [isSignup]);

  const handleSubmit = (e) => {
    e.preventDefault();
    formMutation.mutate({ username, password });
  };

  const renderErrors = () => (
    <ul>
      {errors.map((error, index) => (
        <li key={`error-${index}`}>{error}</li>
      ))}
    </ul>
  );

  return (
    <div className='auth-page'>
      <div className='auth-main'>
        <header className='auth-navbar'>
          <div className='auth-header'>Picture Me Scrolling</div>
          <div className='login-signup'>
            <Link to={navTarget}>{navText}</Link>
          </div>
        </header>
        <div className='auth-body'>
          <section className='auth-page-description'>
            <h1 className='auth-desc-top'>"All for One and One for All"</h1>
            <h1 className='auth-desc-mid1'>View the world of others in one spot!</h1>
            <h1 className='auth-desc-mid2'>Share your world to all!</h1>
            <h1 className='auth-desc-btm'>Express yourself through words, photos, audio &amp; video.</h1>
          </section>
          <section className='auth-form-box'>
            <h1 className='auth-form-header'>Let's Begin</h1>
            <form className='auth-form' onSubmit={handleSubmit}>
              <label className='auth-field'>
                <input
                  type='text'
                  value={username}
                  aria-label='Username'
                  autoComplete='username'
                  placeholder='Your Username'
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  className='auth-login-input'
                />
              </label>
              <label className='auth-field'>
                <input
                  type='password'
                  value={password}
                  aria-label='Password'
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  placeholder='Your Password'
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  className='auth-login-input'
                />
              </label>
              <button type='submit' className='auth-submit'>
                {submitText}
              </button>
            </form>
            <button type='button' className='guest-login' onClick={logInAsGuest}>
              Guest Log In
            </button>
            <div className='auth-errors' aria-live='polite'>{renderErrors()}</div>
          </section>
        </div>
      </div>
      <footer className='auth-footer'>
        <a aria-label='GitHub profile' href='https://github.com/ade713' target='_blank' rel='noopener noreferrer' title='GitHub profile'>
          <i className='fa fa-github fa-2x' aria-hidden='true'></i>
        </a>
        <a aria-label='LinkedIn profile' href='https://www.linkedin.com/in/ade-farquhar-2a66a233' target='_blank' rel='noopener noreferrer' title='LinkedIn profile'>
          <i className='fa fa-linkedin-square fa-2x' aria-hidden='true'></i>
        </a>
      </footer>
    </div>
  );
};

export default AuthForm;
