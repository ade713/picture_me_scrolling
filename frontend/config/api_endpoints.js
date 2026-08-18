export const apiEndpoints = Object.freeze({
  account: Object.freeze({
    avatar: '/api/account/avatar',
    email: '/api/account/email',
    password: '/api/account/password'
  }),
  emailVerification: '/api/email_verification',
  passwordReset: '/api/password_reset',
  posts: Object.freeze({
    collection: '/api/posts',
    detail: id => `/api/posts/${id}`,
    feed: ({ page, perPage, tag }) => {
      const searchParams = new URLSearchParams({
        page,
        per_page: perPage
      });

      if (tag) searchParams.set('tag', tag);

      return `/api/posts?${searchParams.toString()}`;
    },
    like: id => `/api/posts/${id}/like`
  }),
  session: '/api/session',
  users: Object.freeze({
    collection: '/api/users',
    detail: id => `/api/users/${id}`,
    follow: id => `/api/users/${id}/follow`,
    posts: ({ id, page, perPage, tag }) => {
      const searchParams = new URLSearchParams({
        page,
        per_page: perPage
      });

      if (tag) searchParams.set('tag', tag);

      return `/api/users/${id}/posts?${searchParams.toString()}`;
    }
  })
});
