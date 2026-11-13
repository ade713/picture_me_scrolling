// Capture before the mutation: its refetch can remove the reply and its parent.
export const captureReplyDeletionFocus = button => {
  const item = button?.closest('.comment-item');
  const thread = item?.closest('.comment-replies');
  if (!thread) return null;

  const parent = thread.closest('.comment-item');
  const discussion = thread.closest('.post-comments');
  const replies = Array.from(thread.querySelectorAll('.comment-item'));
  const previousReply = replies[replies.indexOf(item) - 1];
  const comments = Array.from(discussion?.querySelectorAll('.comment-item') || [])
    .filter(comment => !comment.closest('.comment-replies'));
  const previousComment = comments[comments.indexOf(parent) - 1];
  const getFocusTarget = comment => comment?.querySelector(':scope > .comment-identity .comment-author, :scope > .comment-deleted');
  const candidates = [
    getFocusTarget(previousReply), getFocusTarget(parent), getFocusTarget(previousComment),
    discussion?.querySelector('h2'),
  ];

  return () => window.requestAnimationFrame(() => {
    candidates.find(element => element?.isConnected)?.focus({ preventScroll: true });
  });
};
