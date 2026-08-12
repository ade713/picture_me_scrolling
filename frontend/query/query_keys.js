export const queryKeys = {
  currentUser: ['currentUser'],
  posts: ['posts'],
  postsFeed: tag => tag ? [...queryKeys.posts, { tag }] : queryKeys.posts,
  post: id => ['posts', id],
  users: ['users'],
  user: id => ['users', id]
};
