export const routes = Object.freeze({
  dashboard: '/dashboard',
  forgotPassword: '/forgot-password',
  home: '/',
  profile: '/users/:id',
  resetPassword: '/reset-password/:token',
  settings: '/settings',
  signup: '/signup',
  userProfile: id => `/users/${id}`,
  verifyEmail: '/verify-email/:token'
});
