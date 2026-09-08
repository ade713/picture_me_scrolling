export const routes = Object.freeze({
  dashboard: '/dashboard',
  dashboardTag: tag => `/dashboard?tag=${encodeURIComponent(tag)}`,
  forgotPassword: '/forgot-password',
  home: '/',
  post: '/posts/:postId',
  postDetail: id => `/posts/${id}`,
  profile: '/users/:id',
  resetPassword: '/reset-password/:token',
  settings: '/settings',
  signup: '/signup',
  userProfile: id => `/users/${id}`,
  userProfileTag: (id, tag) => `/users/${id}?tag=${encodeURIComponent(tag)}`,
  userProfileView: (id, view) => `/users/${id}?view=${view}`,
  verifyEmail: '/verify-email/:token'
});
