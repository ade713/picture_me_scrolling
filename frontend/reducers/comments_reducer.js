import { merge } from 'lodash';

import { RECEIVE_COMMENT,
         EDIT_COMMENT,
         REMOVE_COMMENT } from '../actions/comments_actions';

const CommentsReducer = (state ={}, action) => {
  Object.freeze(state);
  
  const nextState = merge({}, state);
  const comment = action.comment;

  switch (action.type) {
    case RECEIVE_COMMENT:
      return merge({}, state, {
        [comment.id]: comment
      });
    case EDIT_COMMENT:
      nextState[comment.id] = comment;
      return nextState;
    case REMOVE_COMMENT:
      delete nextState[comment.id];
      return nextState;
    default:
      return state;
  }
};

export default CommentsReducer;
