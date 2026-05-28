import { csrfHeaders } from './csrf_api_util';
import { get } from './api_client';

export const fetchUsers = () => (
  get('/api/users')
);

export const fetchUser = id => (
  get(`/api/users/${id}`)
);

export const createFollow = id => {
  return $.ajax({
    method: 'POST',
    url: `/api/users/${id}/follow`,
    dataType: 'json',
    headers: csrfHeaders()
  });
};

export const deleteFollow = id => {
  return $.ajax({
    method: 'DELETE',
    url: `/api/users/${id}/follow`,
    dataType: 'json',
    headers: csrfHeaders()
  });
};
