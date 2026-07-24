export const apiEndpoints = Object.freeze({
  account: Object.freeze({
    avatar: '/api/account/avatar',
    password: '/api/account/password'
  }),
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
