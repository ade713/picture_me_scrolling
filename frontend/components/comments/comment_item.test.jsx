import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Modal from 'react-modal';

import { useCurrentUser } from '../../query/session_hooks';
import { useDeleteComment, useUpdateComment } from '../../query/comment_hooks';
import CommentItem from './comment_item';

vi.mock('../../query/session_hooks', () => ({ useCurrentUser: vi.fn() }));
vi.mock('../../query/comment_hooks', () => ({ useDeleteComment: vi.fn(), useUpdateComment: vi.fn() }));

const comment = {
  id: 3, body: 'Original comment', created_at: '2026-10-14T12:00:00Z', reply_count: 2,
  author: { id: 7, username: 'Author', avatar_url: '/avatar.png' }
};

describe('Comment author controls', () => {
  let update;
  let deletion;
  beforeEach(() => {
    useCurrentUser.mockReturnValue({ data: { id: 7 } });
    update = { mutateAsync: vi.fn(), reset: vi.fn() };
    deletion = { mutateAsync: vi.fn(), reset: vi.fn() };
    useUpdateComment.mockImplementation(() => update);
    useDeleteComment.mockImplementation(() => deletion);
  });
  afterEach(() => vi.clearAllMocks());

  const mount = (props = {}) => {
    const element = <MemoryRouter><ul><CommentItem comment={comment} postId={42}
      onUpdated={vi.fn()} onDeleted={vi.fn()} {...props} /></ul></MemoryRouter>;
    const view = render(element);
    Modal.setAppElement(view.container);
    return view;
  };

  it('shows controls only for the active comment author', () => {
    useCurrentUser.mockReturnValue({ data: { id: 8 } });
    const view = mount();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    view.unmount();
    useCurrentUser.mockReturnValue({ data: { id: 7 } });
    mount({ comment: { ...comment, deleted: true, author: null, body: null } });
    expect(screen.getByText('Comment deleted')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('focuses the editor and discards canceled drafts with focus restored', async () => {
    mount();
    expect(screen.getByRole('button', { name: 'Edit comment' }).querySelector('i')).toHaveClass('fa-pencil-square-o');
    expect(screen.getByRole('button', { name: 'Delete comment' }).querySelector('i')).toHaveClass('fa-trash');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Edit comment' }));
    const input = screen.getByRole('textbox', { name: 'Edit comment' });
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: 'Discard this' } });
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit comment' })).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(screen.getByRole('textbox')).toHaveValue('Original comment');
    expect(update.mutateAsync).not.toHaveBeenCalled();
  });

  it('validates the draft and returns the authoritative updated comment', async () => {
    const onUpdated = vi.fn();
    const updated = { ...comment, body: 'Edited comment' };
    update.mutateAsync.mockResolvedValue(updated);
    mount({ onUpdated });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Edit comment' }));
    const input = screen.getByRole('textbox');
    const save = screen.getByRole('button', { name: 'Save comment' });
    fireEvent.change(input, { target: { value: '  ' } });
    expect(save).toBeDisabled();
    fireEvent.change(input, { target: { value: 'x'.repeat(1001) } });
    expect(save).toBeDisabled();
    expect(screen.getByText('1001 / 1000 characters')).toHaveClass('comment-character-count-over-limit');
    fireEvent.change(input, { target: { value: updated.body } });
    await user.click(save);
    expect(update.mutateAsync).toHaveBeenCalledWith({ id: 3, body: updated.body });
    expect(onUpdated).toHaveBeenCalledWith(updated);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit comment' })).toHaveFocus());
  });

  it('blocks pending edits and preserves a failed draft for retry', async () => {
    const view = mount();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Edit comment' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Keep this draft' } });
    update.isPending = true;
    view.rerender(<MemoryRouter><ul><CommentItem comment={comment} postId={42} /></ul></MemoryRouter>);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    update.isPending = false;
    update.isError = true;
    update.error = { errors: ['Unable to save'] };
    view.rerender(<MemoryRouter><ul><CommentItem comment={comment} postId={42} /></ul></MemoryRouter>);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to save');
    expect(screen.getByRole('textbox')).toHaveValue('Keep this draft');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Retry draft' } });
    expect(update.reset).toHaveBeenCalledTimes(2);
  });

  it('opens confirmation with safe focus and restores focus on Escape', async () => {
    mount();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Delete comment' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'No' })).toHaveFocus());
    expect(screen.getByRole('dialog', { name: 'Delete comment?' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete comment' })).toHaveFocus();
    expect(deletion.mutateAsync).not.toHaveBeenCalled();
  });

  it('confirms deletion and reports completion even after the item unmounts', async () => {
    let resolve;
    deletion.mutateAsync.mockImplementation(() => new Promise(done => { resolve = done; }));
    const onDeleted = vi.fn();
    const view = mount({ onDeleted });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Delete comment' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    expect(deletion.mutateAsync).toHaveBeenCalledWith(3);
    view.unmount();
    await act(async () => resolve());
    expect(onDeleted).toHaveBeenCalledWith(3);
  });

  it('keeps deletion failures in the dialog and allows retry', async () => {
    deletion.isError = true;
    deletion.error = { errors: ['Unable to delete'] };
    deletion.mutateAsync.mockRejectedValue(deletion.error);
    const onDeleted = vi.fn();
    mount({ onDeleted });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Delete comment' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Unable to delete');
    expect(within(dialog).getByRole('button', { name: 'Yes' })).toBeEnabled();
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
