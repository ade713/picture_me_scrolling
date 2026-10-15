export const MAXIMUM_COMMENT_LENGTH = 1_000;

export const commentMessages = Object.freeze({
  formLabel: 'Add a comment',
  editLabel: 'Edit comment',
  edit: 'Edit comment',
  cancel: 'Cancel',
  save: 'Save comment',
  saving: 'Saving comment…',
  saved: 'Comment updated.',
  updateError: 'Unable to update comment. Please try again.',
  delete: 'Delete comment',
  deleteHeading: 'Delete comment?',
  deleteGuidance: 'Are you sure you want to delete this comment? Replies will remain available.',
  deleting: 'Deleting comment…',
  removed: 'Comment deleted.',
  deleteError: 'Unable to delete comment. Please try again.',
  placeholder: 'Write your comment',
  characterCount: count => `${count} / ${MAXIMUM_COMMENT_LENGTH} characters`,
  createError: 'Unable to post comment. Please try again.',
  created: 'Comment posted.',
  submitting: 'Posting comment…',
  submittedHeading: 'Your new comments',
  submittedGuidance: 'Shown separately until they appear in the refreshed discussion below.',
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
