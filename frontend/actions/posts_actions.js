import * as APIUtil from '../util/post_api_util';
import * as Errors from './errors_actions';

export const RECEIVE_ALL_POSTS = 'RECEIVE_ALL_POSTS';
export const RECEIVE_POST = 'RECEIVE_POST';
export const REMOVE_POST = 'REMOVE_POST';
export const EDIT_POST = 'EDIT_POST';
export const RECEIVE_LIKE = 'RECEIVE_LIKE';
export const REMOVE_LIKE = 'REMOVE_LIKE';

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
    .then(post => dispatch(receivePost(post)));
};

export const createPost = post => dispatch => {
  return APIUtil.createPost(post)
    .then(newPost => {
      dispatch(receivePost(newPost));
      dispatch(Errors.clearErrors());
      return newPost;
    }, errors => (
      dispatch(Errors.receiveErrors(errors.responseJSON))
    )
  );
};

export const createMediaPost = post => dispatch => {
  return APIUtil.createMediaPost(post)
    .then(newPost => {
      dispatch(receivePost(newPost));
      dispatch(Errors.clearErrors());
      return newPost;
    }, errors => (
      dispatch(Errors.receiveErrors(errors.responseJSON))
    )
  );
};

export const updatePost = post => dispatch => {
  return (
    APIUtil.updatePost(post)
    .then(updatedPost => {
      dispatch(editPost(updatedPost));
      dispatch(Errors.clearErrors());
    }, errors => {
        dispatch(Errors.receiveErrors(errors.responseJSON));
      }
    )
  );
};

export const deletePost = post => dispatch => {
  return APIUtil.deletePost(post)
    .then(deletedPost => {
      dispatch(removePost(deletedPost));
      dispatch(Errors.clearErrors());
    }, errors => {
      dispatch(Errors.receiveErrors(errors.responseJSON));
    }
  );
};

export const likePost = id => dispatch => {
  return APIUtil.createLike(id)
    .then(post => dispatch(receivePost(post)));
};

export const unlikePost = id => dispatch => {
  return APIUtil.deleteLike(id)
    .then(post => dispatch(receivePost(post)));
};
