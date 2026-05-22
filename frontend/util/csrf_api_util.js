export const csrfToken = () => {
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  return csrfMeta && csrfMeta.content;
};

export const csrfHeaders = () => {
  const token = csrfToken();
  return token ? { 'X-CSRF-Token': token } : {};
};
