import * as APIUtil from '../util/comments_api_util';
import * as Errors from './errors_actions';

export const RECEIVE_COMMENT = 'RECEIVE_COMMENT';
export const EDIT_COMMENT = 'EDIT_POST';
export const REMOVE_COMMENT = 'REMOVE_COMMENT';

export const receiveComment = comment => ({
  type: RECEIVE_COMMENT,
  comment
});

export const editComment = comment => ({
  type: EDIT_COMMENT,
  comment
});

export const removeComment = comment => ({
  type: REMOVE_COMMENT,
  comment
});

export const createComment = comment => dispatch => {
  return APIUtil.createComment(comment)
    .then(newComment => {
      dispatch(receiveComment(newComment));
      dispatch(Errors.clearErrors());
    }, errors => {
      dispatch(Errors.receiveErrors(errors.responsseJSON));
    }
  );
};

export const updateComment = comment => dispatch => {
  return APIUtil.editComment(comment)
  .then(updatedComment => {
    dispatch(editComment(updatedComment));
    dispatch(Errors.clearErrors()); 
  }, errors => {
    dispatch(Errors.receiveErrors(errors.responseJSON));
  });
};

export const deleteComment = comment => dispatch => {
  return APIUtil.deleteComment(comment)
    .then(deletedComment => {
      dispatch(removeComment(comment));
      dispatch(Errors.clearErrors());
    }, errors => {
      dispatch(Errors.receiveErrors(errors.responseJSON));
    });
};
