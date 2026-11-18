import { keepCommentEditorVisible } from './keep_comment_editor_visible';

describe('comment editor focus visibility', () => {
  let section, editor, input, commentForm;

  beforeEach(() => {
    section = document.createElement('section');
    section.innerHTML = `
      <form class="comment-edit-form">
        <textarea></textarea>
        <button>Cancel</button>
      </form>
      <form class="comment-form"></form>
    `;
    editor = section.querySelector('.comment-edit-form');
    input = editor.querySelector('textarea');
    commentForm = section.querySelector('.comment-form');
    vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    vi.spyOn(commentForm, 'getBoundingClientRect').mockReturnValue({ top: 450 });
  });

  afterEach(() => vi.restoreAllMocks());

  it('reveals the whole editor above the fixed form when it fits', () => {
    vi.spyOn(editor, 'getBoundingClientRect').mockReturnValue({ top: 250, bottom: 550, height: 300 });
    keepCommentEditorVisible({ target: input, currentTarget: section });
    expect(window.scrollBy).toHaveBeenCalledWith(0, 100);
  });

  it('reveals the focused action when the editor is taller than the available area', () => {
    const cancel = editor.querySelector('button');
    vi.spyOn(editor, 'getBoundingClientRect').mockReturnValue({ top: -100, bottom: 550, height: 650 });
    vi.spyOn(cancel, 'getBoundingClientRect').mockReturnValue({ top: 510, bottom: 550 });
    keepCommentEditorVisible({ target: cancel, currentTarget: section });
    expect(window.scrollBy).toHaveBeenCalledWith(0, 100);
  });

  it('leaves already visible editors and unrelated focus unchanged', () => {
    vi.spyOn(editor, 'getBoundingClientRect').mockReturnValue({ top: 50, bottom: 350, height: 300 });
    keepCommentEditorVisible({ target: input, currentTarget: section });
    keepCommentEditorVisible({ target: commentForm, currentTarget: section });
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  it('reveals an editor above the viewport', () => {
    vi.spyOn(editor, 'getBoundingClientRect').mockReturnValue({ top: -30, bottom: 270, height: 300 });
    keepCommentEditorVisible({ target: input, currentTarget: section });
    expect(window.scrollBy).toHaveBeenCalledWith(0, -30);
  });
});
