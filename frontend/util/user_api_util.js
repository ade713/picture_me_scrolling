import { apiEndpoints } from '../config/api_endpoints';
import { destroy, get, post } from './api_client';

export const fetchUsers = () => (
  get(apiEndpoints.users.collection)
);

export const fetchUser = id => (
  get(apiEndpoints.users.detail(id))
);

export const createFollow = id => (
  post(apiEndpoints.users.follow(id))
);

export const deleteFollow = id => (
  destroy(apiEndpoints.users.follow(id))
);
