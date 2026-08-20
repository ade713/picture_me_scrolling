export const queryKeys = {
  currentUser: ['currentUser'],
  posts: ['posts'],
  postsFeed: tag => tag ? [...queryKeys.posts, { tag }] : queryKeys.posts,
  post: id => ['posts', id],
  userPosts: (id, tag) => [
    ...queryKeys.posts,
    'user',
    String(id),
    ...(tag ? [{ tag }] : [])
  ],
  users: ['users'],
  user: id => [...queryKeys.users, 'detail', String(id)],
  userFollowers: id => [...queryKeys.user(id), 'followers']
};
