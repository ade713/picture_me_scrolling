import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

    render(<Feed tag="photography" />);

    expect(usePosts).toHaveBeenCalledWith('photography');

    const feedItems = screen.getAllByTestId('feed-item');

    expect(feedItems).toHaveLength(4);
    expect(feedItems[0]).toHaveAttribute('data-priority-media', 'true');
    expect(feedItems[1]).toHaveAttribute('data-priority-media', 'true');
    expect(feedItems[2]).toHaveAttribute('data-priority-media', 'true');
    expect(feedItems[3]).toHaveAttribute('data-priority-media', 'false');
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

    render(<Feed />);

    await user.click(screen.getByRole('button', { name: 'Load more posts' }));

    expect(fetchNextPage).toHaveBeenCalled();
  });
});
