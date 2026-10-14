export const MAXIMUM_COMMENT_LENGTH = 1_000;

export const commentMessages = Object.freeze({
  formLabel: 'Add a comment',
  placeholder: 'Write your comment',
  characterCount: count => `${count} / ${MAXIMUM_COMMENT_LENGTH} characters`,
  createError: 'Unable to post comment. Please try again.',
  created: 'Comment posted.',
  submitting: 'Posting comment…',
  submittedHeading: 'Your new comments',
  submittedGuidance: 'Shown separately until you reach them in the discussion below.',
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
