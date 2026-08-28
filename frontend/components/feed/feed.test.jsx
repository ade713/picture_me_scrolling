import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { usePosts } from '../../query/post_hooks';
import Feed from './feed';

vi.mock('../../query/post_hooks', () => ({
  usePosts: vi.fn()
}));

vi.mock('../posts/post_bar', () => ({
  default: () => <div>Post bar</div>
}));

vi.mock('./feed_item', () => ({
  default: ({ post, priorityMedia }) => (
    <li data-testid="feed-item" data-priority-media={ priorityMedia }>
      { post.title }
    </li>
  )
}));

const posts = [
  { id: 1, title: 'First post' },
  { id: 2, title: 'Second post' },
  { id: 3, title: 'Third post' },
  { id: 4, title: 'Fourth post' }
];

const feedElement = (props = {}) => (
  <MemoryRouter>
    <Feed {...props} />
  </MemoryRouter>
);

const renderFeed = (props = {}) => render(feedElement(props));

describe('Feed', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loaded posts and marks the first three as priority media', () => {
    usePosts.mockReturnValue({
      data: { posts },
      error: null,
      hasNextPage: false,
      isLoading: false
    });

    renderFeed({ tag: 'photography' });

    expect(usePosts).toHaveBeenCalledWith('photography');

    const feedItems = screen.getAllByTestId('feed-item');

    expect(feedItems).toHaveLength(4);
    expect(feedItems[0]).toHaveAttribute('data-priority-media', 'true');
    expect(feedItems[1]).toHaveAttribute('data-priority-media', 'true');
    expect(feedItems[2]).toHaveAttribute('data-priority-media', 'true');
    expect(feedItems[3]).toHaveAttribute('data-priority-media', 'false');
  });

  it('visually hides the unfiltered Posts heading', () => {
    usePosts.mockReturnValue({
      data: { posts },
      error: null,
      hasNextPage: false,
      isLoading: false
    });

    renderFeed();

    expect(screen.getByRole('heading', { name: 'Posts' }))
      .toHaveClass('visually-hidden');
  });

  it('loads the next posts page when more posts are available', async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn();

    usePosts.mockReturnValue({
      data: { posts: posts.slice(0, 2) },
      error: null,
      fetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
      isLoading: false
    });

    renderFeed();

    await user.click(screen.getByRole('button', { name: 'Load more posts' }));

    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('renders the filtered heading and keyboard-accessible clear action', async () => {
    const user = userEvent.setup();
    usePosts.mockReturnValue({
      data: { posts: [] },
      error: null,
      hasNextPage: false,
      isLoading: false
    });

    renderFeed({ tag: 'film_photography' });

    expect(screen.getByRole('heading', { name: 'Posts tagged #film_photography' }))
      .toHaveFocus();
    const clearFilter = screen.getByRole('link', { name: 'Clear tag filter' });
    expect(clearFilter).toHaveAttribute('href', '/dashboard');
    expect(clearFilter).toHaveAttribute('title', 'Clear tag filter');
    expect(clearFilter).toHaveTextContent('× Clear');

    await user.tab();
    expect(clearFilter).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'No posts found' })).toBeInTheDocument();
  });

  it('moves focus to the ordinary feed heading when the filter clears', () => {
    usePosts.mockReturnValue({
      data: { posts },
      error: null,
      hasNextPage: false,
      isLoading: false
    });

    const { rerender } = renderFeed({ tag: 'photography' });

    rerender(feedElement());

    expect(screen.getByRole('heading', { name: 'Posts' })).toHaveFocus();
  });

  it('moves focus when the active tag changes', () => {
    usePosts.mockReturnValue({
      data: { posts },
      error: null,
      hasNextPage: false,
      isLoading: false
    });

    const { rerender } = renderFeed({ tag: 'photography' });
    screen.getByRole('heading', { name: 'Posts tagged #photography' }).blur();

    rerender(feedElement({ tag: 'sunset' }));

    expect(screen.getByRole('heading', { name: 'Posts tagged #sunset' })).toHaveFocus();
  });

  it('does not move filter focus while restoring dashboard history', () => {
    usePosts.mockReturnValue({
      data: { posts },
      error: null,
      hasNextPage: false,
      isLoading: false
    });

    renderFeed({
      shouldFocusHeading: false,
      tag: 'photography'
    });

    expect(screen.getByRole('heading', {
      name: 'Posts tagged #photography'
    })).not.toHaveFocus();
  });

  it('announces the loading state', () => {
    usePosts.mockReturnValue({ isLoading: true });

    renderFeed({ tag: 'photography' });

    expect(screen.getByRole('status')).toHaveTextContent('Loading posts…');
    expect(screen.getByRole('status')).toHaveClass(
      'pagination-loading-indicator--initial'
    );
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('disables the pagination fallback while the next page loads', () => {
    usePosts.mockReturnValue({
      data: { posts: posts.slice(0, 2) },
      error: null,
      hasNextPage: true,
      isFetchingNextPage: true,
      isLoading: false
    });

    renderFeed();

    expect(screen.getByRole('button', { name: 'Loading more posts…' }))
      .toBeDisabled();
  });

  it('keeps posts visible and retries a failed next page', async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn();
    usePosts.mockReturnValue({
      data: { posts: posts.slice(0, 2) },
      error: new Error('Next page failed'),
      fetchNextPage,
      hasNextPage: true,
      isFetchNextPageError: true,
      isFetchingNextPage: false,
      isLoading: false
    });

    renderFeed();

    expect(screen.getAllByTestId('feed-item')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Retry loading' }));

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('renders an error with a retry action', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    usePosts.mockReturnValue({
      error: new Error('Request failed'),
      isLoading: false,
      refetch
    });

    renderFeed({ tag: 'photography' });
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load posts.');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });
});
