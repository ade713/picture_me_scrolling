import { merge } from 'lodash';

import { RECEIVE_ALL_POSTS,
         RECEIVE_POST,
         EDIT_POST,
         REMOVE_POST,
         RECEIVE_LIKE,
         REMOVE_LIKE } from '../actions/posts_actions';

// import


const PostsReducer = (state = {}, action) => {
  Object.freeze(state);

  const nextState = merge({}, state);
  let post;

  switch (action.type) {
    case RECEIVE_ALL_POSTS:
      return merge({}, state, action.posts);
    case RECEIVE_POST:
      post = action.post;
      return merge({}, state, {
        [post.id]: post
      });
    case EDIT_POST:
      post = action.post;
      nextState[post.id] = post;
      return nextState;
    case REMOVE_POST:
      post = action.post;
      delete nextState[post.id];
      return nextState;
    case RECEIVE_LIKE:

      return nextState;
    case REMOVE_LIKE:

      return nextState;
    default:
      return state;
  }
};

export default PostsReducer;
