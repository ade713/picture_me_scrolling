import React from 'react';
import ReactDOM from 'react-dom';

import Root from './components/root';
import configureStore from './store/store';
import { fetchAllPosts,
         fetchPost,
         createPost,
         updatePost,
         deletePost } from './util/post_api_util';
// import { signup,
//          login,
//          logout,
//          receiveCurrentUser,
//          receieveErrors } from './actions/session_actions';

document.addEventListener('DOMContentLoaded', () => {
  let store;
  if (window.currentUser) {
    const preloadedState = {
      session: {
        currentUser: window.currentUser
      }
    };
    store = configureStore(preloadedState);
    delete window.currentUser;
  } else {
    store = configureStore();
  }

  window.getState = store.getState;
  window.dispatch = store.dispatch;

  window.fetchAllPosts = fetchAllPosts;
  window.fetchPost = fetchPost;
  window.createPost = createPost;
  window.updatePost = updatePost;
  window.deletePost = deletePost;

  // window.signup = signup;
  // window.login = login;
  // window.logout = logout;

  const root = document.getElementById('root');
  ReactDOM.render(<Root store={ store } />, root);

});
