export const commentMessages = Object.freeze({
  heading: 'Comments',
  loading: 'Loading comments…',
  loadingMore: 'Loading more comments…',
  loadMore: 'Load more comments',
  empty: 'No comments yet',
  loadError: 'Unable to load comments.',
  deleted: 'Comment deleted',
  replyCount: count => `${count} ${count === 1 ? 'reply' : 'replies'}`
});

export const commentDateOptions = Object.freeze({
  dateStyle: 'medium',
  timeStyle: 'short'
});
