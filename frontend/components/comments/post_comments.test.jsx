import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { usePostComments } from '../../query/comment_hooks';
import PostComments from './post_comments';
import CommentForm from './comment_form';

vi.mock('../../query/comment_hooks', () => ({ usePostComments: vi.fn() }));
vi.mock('./comment_form', () => ({ default: vi.fn(() => null) }));

const comment = {
  id: 1, body: '<strong>Plain text</strong>', created_at: '2026-10-14T12:00:00Z',
  deleted: false, reply_count: 2,
  author: { id: 7, username: 'Comment author', avatar_url: '/avatar.png' }
};
const renderComments = () => render(<MemoryRouter><PostComments postId={42} /></MemoryRouter>);

describe('PostComments', () => {
  beforeEach(() => {
    CommentForm.mockImplementation(() => null);
    usePostComments.mockReturnValue({ data: { comments: [comment] }, fetchNextPage: vi.fn() });
    vi.stubGlobal('IntersectionObserver', undefined);
  });
  afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); });

  it('renders text safely, linked identity, timestamp, and reply counts', () => {
    renderComments();
    expect(usePostComments).toHaveBeenCalledWith(42);
    expect(screen.getByRole('region', { name: 'Comments' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Comment author' })).toHaveAttribute('href', '/users/7');
    expect(screen.getByText('<strong>Plain text</strong>').querySelector('strong')).toBeNull();
    expect(document.querySelector('time')).toHaveAttribute('datetime', comment.created_at);
    expect(screen.getByText('2 replies')).toBeInTheDocument();
  });

  it('hides identity and original text for deleted placeholders', () => {
    usePostComments.mockReturnValue({ data: { comments: [{ ...comment, deleted: true, reply_count: 1 }] } });
    renderComments();
    expect(screen.getByText('Comment deleted')).toBeInTheDocument();
    expect(screen.getByText('1 reply')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText(comment.body)).not.toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });

  it.each([
    ['loading', { isPending: true }, 'Loading comments…', 'status'],
    ['failure', { isError: true }, 'Unable to load comments.', 'alert'],
    ['empty', { data: { comments: [] } }, 'No comments yet', null]
  ])('renders the %s state', (_name, state, text, role) => {
    usePostComments.mockReturnValue(state);
    renderComments();
    expect(screen.getByText(text)).toBeInTheDocument();
    if (role) expect(screen.getByRole(role)).toHaveTextContent(text);
  });

  it('keeps cached comments visible alongside a background-refetch error', () => {
    usePostComments.mockReturnValue({
      data: { comments: [comment] },
      isError: true,
      isFetchNextPageError: false,
      fetchNextPage: vi.fn()
    });

    renderComments();

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load comments.');
    expect(screen.getByText(comment.body)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Comment author' })).toBeInTheDocument();
    expect(screen.queryByText('No comments yet')).not.toBeInTheDocument();
  });

  it('keeps comments visible and supports keyboard retry after next-page failure', async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn();
    usePostComments.mockReturnValue({ data: { comments: [comment] }, hasNextPage: true,
      isError: true, isFetchNextPageError: true, fetchNextPage });
    renderComments();
    expect(screen.getByText(comment.body)).toBeInTheDocument();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('offers a manual fallback without IntersectionObserver', async () => {
    const fetchNextPage = vi.fn();
    usePostComments.mockReturnValue({ data: { comments: [comment] }, hasNextPage: true, fetchNextPage });
    renderComments();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Load more comments' }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('keeps new submissions visible until loaded, then retires their local copies', async () => {
    const submitted = { ...comment, id: 2, body: 'New comment' };
    CommentForm.mockImplementation(({ onCreated }) => (
      <button onClick={() => onCreated(submitted)}>Submit fixture</button>
    ));
    const view = renderComments();
    await userEvent.setup().click(screen.getByText('Submit fixture'));
    expect(screen.getByText('Your new comments')).toBeInTheDocument();
    expect(screen.getAllByText('New comment')).toHaveLength(1);

    usePostComments.mockReturnValue({ data: { comments: [comment, submitted] } });
    view.rerender(<MemoryRouter><PostComments postId={42} /></MemoryRouter>);
    expect(screen.queryByText('Your new comments')).not.toBeInTheDocument();
    expect(screen.getAllByText('New comment')).toHaveLength(1);

    usePostComments.mockReturnValue({ data: { comments: [comment] } });
    view.rerender(<MemoryRouter><PostComments postId={42} /></MemoryRouter>);
    expect(screen.queryByText('New comment')).not.toBeInTheDocument();
  });

  it('preserves multiple submissions even when the discussion cannot load', async () => {
    usePostComments.mockReturnValue({ isError: true });
    let nextId = 2;
    CommentForm.mockImplementation(({ onCreated }) => (
      <button onClick={() => {
        onCreated({ ...comment, id: nextId, body: `Submission ${nextId}` });
        nextId += 1;
      }}>Submit fixture</button>
    ));
    renderComments();
    const user = userEvent.setup();
    await user.click(screen.getByText('Submit fixture'));
    await user.click(screen.getByText('Submit fixture'));
    expect(screen.getByText('Submission 2')).toBeInTheDocument();
    expect(screen.getByText('Submission 3')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load comments.');
  });
});
