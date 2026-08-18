import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useUserPosts } from '../../query/post_hooks';
import ProfilePosts from './profile_posts';

vi.mock('../../query/post_hooks', () => ({
  useUserPosts: vi.fn()
}));

vi.mock('../feed/feed_item', () => ({
  default: ({ post, priorityMedia }) => (
    <li data-priority-media={priorityMedia} data-testid="profile-post">
      {post.title}
    </li>
  )
}));

const posts = [
  { id: 1, title: 'First post' },
  { id: 2, title: 'Second post' },
  { id: 3, title: 'Third post' },
  { id: 4, title: 'Fourth post' }
];

describe('ProfilePosts', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the profile posts and prioritizes the first three media items', () => {
    useUserPosts.mockReturnValue({
      data: { posts },
      hasNextPage: false,
      isError: false,
      isLoading: false
    });

    render(<ProfilePosts profileId={42} />);

    expect(useUserPosts).toHaveBeenCalledWith(42);
    const postItems = screen.getAllByTestId('profile-post');
    expect(postItems).toHaveLength(4);
    expect(postItems[0]).toHaveAttribute('data-priority-media', 'true');
    expect(postItems[1]).toHaveAttribute('data-priority-media', 'true');
    expect(postItems[2]).toHaveAttribute('data-priority-media', 'true');
    expect(postItems[3]).toHaveAttribute('data-priority-media', 'false');
  });

  it('announces the loading state', () => {
    useUserPosts.mockReturnValue({ isLoading: true });

    render(<ProfilePosts profileId={42} />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading posts…');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows the profile posts error without a retry action', () => {
    useUserPosts.mockReturnValue({ isError: true, isLoading: false });

    render(<ProfilePosts profileId={42} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load posts.');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the unfiltered empty state', () => {
    useUserPosts.mockReturnValue({
      data: { posts: [] },
      hasNextPage: false,
      isError: false,
      isLoading: false
    });

    render(<ProfilePosts profileId={42} />);

    expect(screen.getByRole('heading', { name: 'No posts yet' })).toBeInTheDocument();
  });

  it('loads the next page when more posts are available', async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn();
    useUserPosts.mockReturnValue({
      data: { posts: posts.slice(0, 2) },
      fetchNextPage,
      hasNextPage: true,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false
    });

    render(<ProfilePosts profileId={42} />);
    await user.click(screen.getByRole('button', { name: 'Load more posts' }));

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('disables the pagination action while the next page loads', () => {
    useUserPosts.mockReturnValue({
      data: { posts: posts.slice(0, 2) },
      hasNextPage: true,
      isError: false,
      isFetchingNextPage: true,
      isLoading: false
    });

    render(<ProfilePosts profileId={42} />);

    expect(screen.getByRole('button', { name: 'Loading posts...' })).toBeDisabled();
  });
});
