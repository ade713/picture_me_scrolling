import * as APIUtil from '../util/user_api_util';
import { receivePost, receiveAllPosts } from './posts_actions';

export const RECEIVE_USERS = 'RECEIVE_USERS';
export const RECEIVE_USER = 'RECEIVE_USER';

export const receiveUsers = users => ({
  type: RECEIVE_USERS,
  users
});

export const receiveUser = user => ({
  type: RECEIVE_USER,
  user
});

export const requestUsers = () => dispatch => {
  return APIUtil.fetchUsers()
    .then(users => dispatch(receiveUsers(users)));
};

export const requestUser = id => dispatch => {
  return APIUtil.fetchUser(id)
    .then(user => dispatch(receiveUser(user)));
};

export const followUser = id => dispatch => {
  return APIUtil.createFollow(id)
    .then(posts => dispatch(receiveAllPosts(posts)));
};

export const unfollowUser = id => dispatch => {
  return APIUtil.deleteFollow(id)
    .then(posts => dispatch(receiveAllPosts(posts)));
};
