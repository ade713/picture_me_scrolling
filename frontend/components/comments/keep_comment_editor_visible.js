// Native focus scrolling does not account for the fixed comment form.
export const keepCommentEditorVisible = event => {
  const editor = event.target.closest('.comment-edit-form');
  if (!editor) return;

  const commentForm = event.currentTarget.querySelector('.comment-form');
  if (!commentForm) return;

  const availableBottom = commentForm.getBoundingClientRect().top;
  const editorBounds = editor.getBoundingClientRect();
  // Show the whole editor when it fits; on short screens prioritize the
  // focused control rather than scrolling its input out of view.
  const bounds = editorBounds.height <= availableBottom
    ? editorBounds
    : event.target.getBoundingClientRect();

  if (bounds.bottom > availableBottom) {
    window.scrollBy(0, bounds.bottom - availableBottom);
  } else if (bounds.top < 0) {
    window.scrollBy(0, bounds.top);
  }
};
