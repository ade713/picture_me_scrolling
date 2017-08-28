import * as APIUtil from '../util/user_api_util';
import { receivePost } from './posts_actions';

export const RECEIVE_USERS = 'RECEIVE_USERS';

export const receiveUsers = users => ({
  type: RECEIVE_USERS,
  users
});

export const requestUsers = () => dispatch => {
  return APIUtil.fetchUsers()
    .then(users => dispatch(receiveUsers(users)));
};

export const followUser = id => dispatch => {
  return APIUtil.createFollow(id)
    .then(post => dispatch(receivePost(post)));
};

export const unfollowUser = id => dispatch => {
  return APIUtil.deleteFollow(id)
    .then(post => dispatch(receivePost(post)));
};