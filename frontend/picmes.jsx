import React from 'react';
import ReactDOM from 'react-dom';

import Root from './components/root';
import configureStore from './store/store';
import { signup,
         login,
         logout,
         receiveCurrentUser,
         receieveErrors } from './actions/session_actions';
// import { signup, login, logout } from './util/session_api_util';

document.addEventListener('DOMContentLoaded', () => {
  let store;


  window.receiveCurrentUser = receiveCurrentUser;
  window.receieveErrors = receieveErrors;
  window.signup = signup;
  window.login = login;
  window.logout = logout;

  if (window.currentUser) {
    const preloadedState = { session: { currentUser: window.currentUser } };
    store = configureStore(preloadedState);
    delete window.currentUser;
  } else {
    store = configureStore();
  }

  window.getState = store.getState;

  window.dispatch = store.dispatch;

  const root = document.getElementById('root');
  ReactDOM.render(<Root store={ store } />, root);

});
