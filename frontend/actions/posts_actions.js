import * as APIUtil from '../util/post_api_util';
import * as Errors from './errors_actions';

export const RECEIVE_ALL_POSTS = 'RECEIVE_ALL_POSTS';
export const RECEIVE_POST = 'RECEIVE_POST';
export const REMOVE_POST = 'REMOVE_POST';
export const EDIT_POST = 'EDIT_POST';

export const receiveAllPosts = posts => ({
  type: RECEIVE_ALL_POSTS,
  posts
});

export const receivePost = post => ({
  type: RECEIVE_POST,
  post
});

export const removePost = post => ({
  type: REMOVE_POST,
  post
});

export const editPost = post => ({
  type: EDIT_POST,
  post
});


export const requestAllPosts = () => dispatch => {
  return APIUtil.fetchAllPosts()
    .then(posts => dispatch(receiveAllPosts(posts)));
};

export const requestPost = id => dispatch => {
  return APIUtil.fetchPost(id)
    .then(post => dispatch(receivePost(id)));
};
