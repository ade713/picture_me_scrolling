import { destroy, get, post } from './api_client';

export const fetchUsers = () => (
  get('/api/users')
);

export const fetchUser = id => (
  get(`/api/users/${id}`)
);

export const createFollow = id => (
  post(`/api/users/${id}/follow`)
);

export const deleteFollow = id => (
  destroy(`/api/users/${id}/follow`)
);
