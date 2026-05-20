const csrfToken = () => {
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  return csrfMeta && csrfMeta.content;
};

const csrfHeaders = () => {
  const token = csrfToken();
  return token ? { 'X-CSRF-Token': token } : {};
};

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
