import React from 'react';
import ReactDOM from 'react-dom';

import configureStore from './store/store';
import { signup,
         login,
         logout,
         receiveCurrentUser,
         receieveErrors } from './actions/session_actions';
// import { signup, login, logout } from './util/session_api_util';

document.addEventListener('DOMContentLoaded', () => {
  const store = configureStore();
  const root = document.getElementById('root');
  ReactDOM.render(<h1>Picture Me Scrolling, PicMeS</h1>, root);

  window.getState = store.getState;
  window.dispatch = store.dispatch;

  window.receiveCurrentUser = receiveCurrentUser;
  window.receieveErrors = receieveErrors;
  window.signup = signup;
  window.login = login;
  window.logout = logout;
});
