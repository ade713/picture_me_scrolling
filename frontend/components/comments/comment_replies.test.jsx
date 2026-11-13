import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { get } from '../../util/api_client';
import { queryKeys } from '../../query/query_keys';
import CommentReplies from './comment_replies';

vi.mock('../../util/api_client', () => ({ get: vi.fn() }));
vi.mock('../../query/session_hooks', () => ({ useCurrentUser: () => ({ data: { id: 7 } }) }));

const reply = (id, body) => ({ id, body, created_at: '2026-10-21T12:00:00Z', reply_count: 0,
  author: { id: 7, username: `Author ${id}`, avatar_url: '/avatar.png' } });
const page = (replies, cursor = null) => ({
  comments: Object.fromEntries(replies.map(item => [item.id, item])),
  comment_ids: replies.map(item => item.id),
  pagination: { has_more: Boolean(cursor), next_cursor: cursor, per_page: 5 }
});

describe('CommentReplies', () => {
  let client;
  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });
  afterEach(() => { client.clear(); vi.resetAllMocks(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
  const mount = (children = <CommentReplies postId={42} commentId={1} />) => render(
    <QueryClientProvider client={client}><MemoryRouter>{children}</MemoryRouter></QueryClientProvider>
  );

  it('fetches only on keyboard expansion and keeps reply display read-only', async () => {
    get.mockResolvedValue(page([reply(3, 'Visit https://example.com')]));
    mount();
    expect(get).not.toHaveBeenCalled();
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{Enter}');
    await screen.findByRole('link', { name: 'https://example.com' });
    expect(get).toHaveBeenCalledWith('/api/comments/1/replies?per_page=5', { signal: expect.any(AbortSignal) });
    expect(screen.getByRole('button', { name: 'Hide replies' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('button', { name: 'Edit comment' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hide replies' }));
    expect(screen.queryByText('Visit')).not.toBeInTheDocument();
    expect(client.getQueryData(queryKeys.commentReplies(42, 1))).toBeDefined();
  });

  it('appends five newer replies and holds the last previously loaded reply in place', async () => {
    const firstBatch = Array.from({ length: 5 }, (_, index) => reply(index + 1, `Reply ${index + 1}`));
    const nextBatch = Array.from({ length: 5 }, (_, index) => reply(index + 6, `Reply ${index + 6}`));
    get.mockResolvedValueOnce(page(firstBatch, 'next+/='))
      .mockResolvedValueOnce(page(nextBatch));
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      // Only the previous last reply moves: ensure it is the chosen anchor.
      const top = this.textContent.includes('Reply 5') && document.body.textContent.includes('Reply 10') ? 220 : 100;
      return { top, bottom: top + 100 };
    });
    const view = mount();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'View replies' }));
    const moreButton = await screen.findByRole('button', { name: 'Show more replies' });
    expect(screen.getByRole('list').compareDocumentPosition(moreButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await user.click(moreButton);
    await screen.findByText('Reply 10');
    expect(Array.from(view.container.querySelectorAll('.comment-body'), node => node.textContent))
      .toEqual([...firstBatch, ...nextBatch].map(item => item.body));
    expect(get).toHaveBeenLastCalledWith('/api/comments/1/replies?per_page=5&after=next%2B%2F%3D', { signal: expect.any(AbortSignal) });
    expect(scroll).toHaveBeenCalledWith(0, 120);
    expect(screen.queryByRole('button', { name: 'Show more replies' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Author 5' })).toHaveFocus();
  });

  it('does not steal focus moved elsewhere during a next-page request', async () => {
    let resolveNext;
    get.mockResolvedValueOnce(page([reply(1, 'First reply')], 'next'))
      .mockImplementationOnce(() => new Promise(resolve => { resolveNext = resolve; }));
    vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 100, bottom: 200 });
    mount(<><button type="button">Other control</button><CommentReplies postId={42} commentId={1} /></>);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'View replies' }));
    await user.click(await screen.findByRole('button', { name: 'Show more replies' }));
    await user.click(screen.getByRole('button', { name: 'Other control' }));
    await act(async () => resolveNext(page([reply(2, 'Next reply')])));
    await screen.findByText('Next reply');
    expect(screen.getByRole('button', { name: 'Other control' })).toHaveFocus();
  });

  it.each([false, true])('preserves the current view with browser anchoring: %s', async browserAnchored => {
    let resolveNext;
    let top = 100;
    get.mockResolvedValueOnce(page([reply(1, 'First reply')], 'next'))
      .mockImplementationOnce(() => new Promise(resolve => { resolveNext = resolve; }));
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ top, bottom: top + 100 }));
    mount();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'View replies' }));
    await user.click(await screen.findByRole('button', { name: 'Show more replies' }));
    // A reader scrolls while waiting. Preserve this position, not the click-time one.
    top = 60;
    fireEvent.scroll(window);
    if (browserAnchored) vi.stubGlobal('scrollY', 120);
    else top += 120;
    await act(async () => resolveNext(page([reply(2, 'Next reply')])));
    await screen.findByText('Next reply');
    if (browserAnchored) expect(scroll).not.toHaveBeenCalled();
    else expect(scroll).toHaveBeenCalledWith(0, 120);
  });

  it('retries initial and next-page failures without discarding visible replies', async () => {
    get.mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page([reply(1, 'First reply')], 'next'))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page([]));
    mount();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'View replies' }));
    await user.click(await screen.findByRole('button', { name: 'Try again' }));
    await screen.findByText('First reply');
    await user.click(screen.getByRole('button', { name: 'Show more replies' }));
    await screen.findByRole('button', { name: 'Retry loading' });
    expect(screen.getByText('First reply')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry loading' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('isolates parent caches and supports empty replies', async () => {
    get.mockImplementation(url => Promise.resolve(page(url.includes('/1/') ? [reply(3, 'First thread')] : [])));
    mount(<><section aria-label="First"><CommentReplies postId={42} commentId={1} /></section>
      <section aria-label="Second"><CommentReplies postId={42} commentId={2} /></section></>);
    const user = userEvent.setup();
    await user.click(within(screen.getByRole('region', { name: 'First' })).getByRole('button'));
    await screen.findByText('First thread');
    expect(get).toHaveBeenCalledTimes(1);
    await user.click(within(screen.getByRole('region', { name: 'Second' })).getByRole('button'));
    await screen.findByText('No replies yet');
    expect(client.getQueryData(queryKeys.commentReplies(42, 1)).pages[0].comment_ids).toEqual([3]);
    expect(client.getQueryData(queryKeys.commentReplies(42, 2)).pages[0].comment_ids).toEqual([]);
  });
});
