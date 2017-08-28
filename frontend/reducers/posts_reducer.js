import { merge } from 'lodash';

import { RECEIVE_ALL_POSTS,
         RECEIVE_POST,
         EDIT_POST,
         REMOVE_POST } from '../actions/posts_actions';

const PostsReducer = (state = {}, action) => {
  Object.freeze(state);

  const nextState = merge({}, state);
  let post = action.post;
  const like = action.like;

  switch (action.type) {
    case RECEIVE_ALL_POSTS:
      return merge({}, state, action.posts);
    case RECEIVE_POST:
      return merge({}, state, {
        [post.id]: post
      });
    case EDIT_POST:
      nextState[post.id] = post;
      return nextState;
    case REMOVE_POST:
      delete nextState[post.id];
      return nextState;
    default:
      return state;
  }
};

export default PostsReducer;
