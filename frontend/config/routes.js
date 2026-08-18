export const routes = Object.freeze({
  dashboard: '/dashboard',
  forgotPassword: '/forgot-password',
  home: '/',
  profile: '/users/:id',
  resetPassword: '/reset-password/:token',
  settings: '/settings',
  signup: '/signup',
  userProfile: id => `/users/${id}`,
  userProfileView: (id, view) => `/users/${id}?view=${view}`,
  verifyEmail: '/verify-email/:token'
});
