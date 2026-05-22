import { csrfHeaders } from './csrf_api_util';

export const fetchUsers = () => {
  return $.ajax({
    method: 'GET',
    url: '/api/users',
    dataType: 'json'
  });
};

export const fetchUser = id => {
  return $.ajax({
    method: 'GET',
    url: `/api/users/${id}`,
    dataType: 'json'
  });
};

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
