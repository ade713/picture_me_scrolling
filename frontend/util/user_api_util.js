const csrfToken = () => {
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  return csrfMeta && csrfMeta.content;
};

const csrfHeaders = () => {
  const token = csrfToken();
  return token ? { 'X-CSRF-Token': token } : {};
};

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
