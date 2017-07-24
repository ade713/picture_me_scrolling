import React from 'react';
import ReactDOM from 'react-dom';

import Root from './components/root';
import configureStore from './store/store';
import { requestAllPosts,
         requestPost,
         receiveAllPosts,
         receivePost,
         removePost,
         editPost,
         createPost,
         updatePost,
         deletePost } from './actions/posts_actions';
import { fetchAllPosts,
         fetchPost
        } from './util/post_api_util';


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

  window.requestAllPosts = requestAllPosts;
  window.requestPost = requestPost;
  window.receiveAllPosts = receiveAllPosts;
  window.receivePost = receivePost;
  window.removePost = removePost;
  window.editPost = editPost;
  window.createPost = createPost;
  window.updatePost = updatePost;
  window.deletePost = deletePost;

  window.fetchAllPosts = fetchAllPosts;
  window.fetchPost = fetchPost;
  // window.createPost = createPost;
  // window.updatePost = updatePost;
  // window.deletePost = deletePost;

  const root = document.getElementById('root');
  ReactDOM.render(<Root store={ store } />, root);

});

// ,
//  createPost,
//  updatePost,
//  deletePost
