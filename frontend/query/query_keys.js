export const queryKeys = {
  currentUser: ['currentUser'],
  posts: ['posts'],
  post: id => ['posts', id],
  users: ['users'],
  user: id => ['users', id]
};
