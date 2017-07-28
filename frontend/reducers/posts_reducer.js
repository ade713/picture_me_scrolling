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
    case RECEIVE_LIKE:
      if (!state[like.post_id].likes.includes(like.user_id)) {
        nextState[like.post_id].likes.push(like.user_id);
      }
      return nextState;
    case REMOVE_LIKE:
      if (state[like.post_id].likes.includes(like.user_id)) {
        let likeIndex = nextState[like.post_id].likes.indexOf(like.user_id);
        nextState[like.post_id].likes.splice(likeIndex, 1);
      }
      return nextState;
    default:
      return state;
  }
};

export default PostsReducer;
