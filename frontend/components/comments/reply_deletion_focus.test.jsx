import React from 'react';
import { render, screen } from '@testing-library/react';
import { captureReplyDeletionFocus } from './reply_deletion_focus';

describe('reply deletion focus', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { callback(); return 1; });
  });
  afterEach(() => vi.restoreAllMocks());

  const setup = (deletedParent = false) => {
    render(<section className="post-comments">
      <h2 tabIndex={-1}>Comments</h2>
      <ul>
        <li className="comment-item"><div className="comment-identity"><a className="comment-author" href="#previous">Previous comment</a></div></li>
        <li className="comment-item">
          {deletedParent ? <p className="comment-deleted" tabIndex={-1}>Comment deleted</p> :
            <div className="comment-identity"><a className="comment-author" href="#parent">Parent</a></div>}
          <div className="comment-replies"><ul>
            <li className="comment-item"><div className="comment-identity"><a className="comment-author" href="#first">First reply</a></div><button>Delete first</button></li>
            <li className="comment-item"><div className="comment-identity"><a className="comment-author" href="#second">Second reply</a></div><button>Delete second</button></li>
          </ul></div>
        </li>
      </ul>
    </section>);
  };

  it.each([
    ['Delete second', 'First reply'],
    ['Delete first', 'Parent'],
  ])('restores %s to %s without scrolling', (buttonName, targetName) => {
    setup();
    const button = screen.getByRole('button', { name: buttonName });
    const restore = captureReplyDeletionFocus(button);
    const target = screen.getByRole('link', { name: targetName });
    const focus = vi.spyOn(target, 'focus');
    button.closest('.comment-item').remove();
    restore();
    expect(target).toHaveFocus();
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('focuses a retained deleted-parent placeholder', () => {
    setup(true);
    const button = screen.getByRole('button', { name: 'Delete first' });
    const restore = captureReplyDeletionFocus(button);
    button.closest('.comment-item').remove();
    restore();
    expect(screen.getByText('Comment deleted')).toHaveFocus();
  });

  it.each([false, true])('falls back when the parent disappears (previous removed: %s)', removePrevious => {
    setup();
    const restore = captureReplyDeletionFocus(screen.getByRole('button', { name: 'Delete first' }));
    screen.getByRole('link', { name: 'Parent' }).closest('.comment-item').remove();
    if (removePrevious) screen.getByRole('link', { name: 'Previous comment' }).closest('.comment-item').remove();
    restore();
    expect(removePrevious ? screen.getByRole('heading') : screen.getByRole('link', { name: 'Previous comment' })).toHaveFocus();
  });
});
