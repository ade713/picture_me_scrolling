export const apiEndpoints = Object.freeze({
  account: Object.freeze({
    avatar: '/api/account/avatar',
    email: '/api/account/email',
    password: '/api/account/password'
  }),
  emailVerification: '/api/email_verification',
  posts: Object.freeze({
    collection: '/api/posts',
    detail: id => `/api/posts/${id}`,
    feed: ({ page, perPage }) => `/api/posts?page=${page}&per_page=${perPage}`,
    like: id => `/api/posts/${id}/like`
  }),
  session: '/api/session',
  users: Object.freeze({
    collection: '/api/users',
    detail: id => `/api/users/${id}`,
    follow: id => `/api/users/${id}/follow`
  })
});
