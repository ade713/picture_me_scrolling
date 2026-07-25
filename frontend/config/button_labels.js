export const buttonLabels = Object.freeze({
  cancelDelete: 'No',
  clearSelection: 'Clear selection',
  close: 'Close',
  confirmDelete: 'Yes',
  follow: 'Follow',
  guestLogin: 'Guest Log In',
  loadMorePosts: 'Load more posts',
  loadingPosts: 'Loading posts...',
  logIn: 'Log In',
  loggingOut: 'Logging out…',
  logOut: 'Log Out',
  post: 'Post',
  save: 'Save',
  signUp: 'Sign Up',
  unfollow: 'Unfollow',
  updateAvatar: 'Update avatar',
  updatePassword: 'Update password',
  updatingAvatar: 'Updating avatar…',
  updatingPassword: 'Updating password…'
});

export const buttonActionLabels = Object.freeze({
  deletePost: postLabel => `Delete ${postLabel}`,
  editPost: postLabel => `Edit ${postLabel}`,
  followUser: username => `${buttonLabels.follow} ${username}`,
  likePost: postLabel => `Like ${postLabel}`,
  unfollowUser: username => `${buttonLabels.unfollow} ${username}`,
  unlikePost: postLabel => `Unlike ${postLabel}`
});
