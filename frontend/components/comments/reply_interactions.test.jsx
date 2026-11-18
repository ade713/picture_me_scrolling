import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from 'react-modal';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { get, post, patch, destroy } from '../../util/api_client';
import { queryKeys } from '../../query/query_keys';
import CommentReplies from './comment_replies';

vi.mock('../../util/api_client', () => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), destroy: vi.fn() }));
vi.mock('../../query/session_hooks', () => ({ useCurrentUser: () => ({ data: { id: 7 } }) }));

const reply = (id, body, authorId = 7) => ({ id, body, parent_id: 1, post_id: 42,
  created_at: '2026-10-21T12:00:00Z', reply_count: 0,
  author: { id: authorId, username: `Author ${authorId}`, avatar_url: '/avatar.png' } });
const page = (replies, cursor = null) => ({
  comments: Object.fromEntries(replies.map(item => [item.id, item])),
  comment_ids: replies.map(item => item.id),
  pagination: { has_more: Boolean(cursor), next_cursor: cursor, per_page: 5 }
});

describe('reply interactions', () => {
  let client;
  const tree = props => <QueryClientProvider client={client}><MemoryRouter>
    <CommentReplies postId={42} commentId={1} replyCount={5} {...props} />
  </MemoryRouter></QueryClientProvider>;

  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    get.mockResolvedValue(page([reply(2, 'Existing reply', 8)], 'next'));
  });
  afterEach(() => { client.clear(); vi.resetAllMocks(); });

  it('validates a reply, retains a failed draft, and shows a successful reply beyond loaded pages', async () => {
    const user = userEvent.setup();
    render(tree({ replyCount: 0 }));
    expect(screen.queryByText('View replies')).not.toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Reply', exact: true }));
    const input = screen.getByRole('textbox', { name: 'Add a reply' });
    expect(input).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Post reply' })).toBeDisabled();
    fireEvent.change(input, { target: { value: 'a'.repeat(1001) } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('1001 / 1000 characters')).toHaveClass('comment-character-count-over-limit');
    expect(screen.getByRole('button', { name: 'Post reply' })).toBeDisabled();

    // Server errors preserve the draft; editing clears stale mutation feedback.
    post.mockRejectedValueOnce({ errors: ['Parent was deleted'] });
    fireEvent.change(input, { target: { value: 'My reply' } });
    await user.click(screen.getByRole('button', { name: 'Post reply' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Parent was deleted');
    expect(input).toHaveValue('My reply');
    fireEvent.change(input, { target: { value: 'My new reply' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Pending submissions cannot be repeated or cancelled.
    let resolve;
    post.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    await user.click(screen.getByRole('button', { name: 'Post reply' }));
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await act(async () => resolve(reply(50, 'My new reply')));
    const submissions = await screen.findByRole('region', { name: 'Your new replies' });
    expect(within(submissions).getByText('My new reply')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View more replies' })).toBeInTheDocument();
    expect(post).toHaveBeenLastCalledWith('/api/comments/1/replies', { comment: { body: 'My new reply' } });
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();

    // Collapse/reopen retains the fallback; loading its real page retires it.
    await user.click(screen.getByRole('button', { name: 'Hide replies' }));
    await user.click(screen.getByRole('button', { name: 'View replies' }));
    await screen.findByText('My new reply');
    get.mockResolvedValueOnce(page([reply(50, 'My new reply')]));
    await user.click(screen.getByRole('button', { name: 'View more replies' }));
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Your new replies' })).not.toBeInTheDocument());
    expect(screen.getAllByText('My new reply')).toHaveLength(1);
    await act(async () => client.setQueryData(queryKeys.commentReplies(42, 1), {
      pages: [page([])], pageParams: [null]
    }));
    await waitFor(() => expect(screen.queryByText('My new reply')).not.toBeInTheDocument());
  });

  it('cancels with restored focus and removes an open form when the parent is deleted', async () => {
    const user = userEvent.setup();
    const view = render(tree());
    await user.click(screen.getByRole('button', { name: 'Reply', exact: true }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reply', exact: true })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Reply', exact: true }));
    view.rerender(tree({ deleted: true }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reply', exact: true })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide replies' })).toHaveFocus();
    expect(post).not.toHaveBeenCalled();
  });

  it('edits and deletes a submitted reply that has not reached the loaded pages', async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    post.mockResolvedValue(reply(50, 'New reply outside pages'));
    const view = render(tree({ onDeleted }));
    Modal.setAppElement(view.container);
    await user.click(screen.getByRole('button', { name: 'Reply', exact: true }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New reply outside pages' } });
    await user.click(screen.getByRole('button', { name: 'Post reply' }));
    await screen.findByText('New reply outside pages');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    patch.mockResolvedValue(reply(50, 'Edited fallback reply'));
    await user.click(screen.getByRole('button', { name: 'Edit comment' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Edited fallback reply' } });
    await user.click(screen.getByRole('button', { name: 'Save comment' }));
    await screen.findByText('Edited fallback reply');

    destroy.mockResolvedValue(null);
    await user.click(screen.getByRole('button', { name: 'Delete comment' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await waitFor(() => expect(screen.queryByText('Edited fallback reply')).not.toBeInTheDocument());
    expect(onDeleted).toHaveBeenCalledWith(50);
    // The parent owns the deletion announcement; the thread clears stale feedback.
    expect(screen.queryByText('Comment deleted.')).not.toBeInTheDocument();
    expect(screen.queryByText('Comment updated.')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hide replies' }));
    await user.click(screen.getByRole('button', { name: 'View replies' }));
    expect(screen.queryByText('Edited fallback reply')).not.toBeInTheDocument();
  });

  it('allows author edit/delete beneath a deleted parent without allowing nested replies', async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    get.mockResolvedValue(page([reply(2, 'My existing reply'), reply(3, 'Someone else', 8)]));
    const view = render(tree({ deleted: true, onDeleted }));
    Modal.setAppElement(view.container);
    await user.click(screen.getByRole('button', { name: 'View replies' }));
    await screen.findByText('My existing reply');
    expect(screen.queryByRole('button', { name: 'Reply', exact: true })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Edit comment' })).toHaveLength(1);

    get.mockResolvedValue(page([reply(2, 'Edited reply'), reply(3, 'Someone else', 8)]));
    patch.mockResolvedValue(reply(2, 'Edited reply'));
    await user.click(screen.getByRole('button', { name: 'Edit comment' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Edited reply' } });
    await user.click(screen.getByRole('button', { name: 'Save comment' }));
    await screen.findByText('Edited reply');
    expect(patch).toHaveBeenCalledWith('/api/comments/2', { comment: { body: 'Edited reply' } });

    get.mockResolvedValue(page([reply(3, 'Someone else', 8)]));
    destroy.mockResolvedValue(null);
    await user.click(screen.getByRole('button', { name: 'Delete comment' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith(2));
    expect(screen.queryByText('Edited reply')).not.toBeInTheDocument();
    expect(screen.getByText('Someone else')).toBeInTheDocument();
  });
});
