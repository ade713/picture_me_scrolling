import { csrfHeaders } from './csrf_api_util';

export const signup = user => (
  $.ajax({
    method: 'POST',
    url: '/api/users',
    data: { user },
    dataType: 'json',
    headers: csrfHeaders()
  })
);

export const login = user => (
  $.ajax({
    method: 'POST',
    url: '/api/session',
    data: { user },
    dataType: 'json',
    headers: csrfHeaders()
  })
);

export const logout = () => (
  $.ajax({
    method: 'DELETE',
    url: '/api/session',
    dataType: 'json',
    headers: csrfHeaders()
  })
);
