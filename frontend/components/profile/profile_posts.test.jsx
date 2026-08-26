import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useUserPosts } from '../../query/post_hooks';
import ProfilePosts from './profile_posts';

vi.mock('../../query/post_hooks', () => ({
  useUserPosts: vi.fn()
}));

vi.mock('../feed/feed_item', async () => {
  const { usePostTagDestination } = await import(
    '../feed/post_tag_navigation_context'
  );
  const MockFeedItem = ({ post, priorityMedia }) => {
    const tagDestination = usePostTagDestination();

    return (
      <li data-priority-media={priorityMedia} data-testid="profile-post">
        {post.title}
        <a href={tagDestination('photography')}>Photography tag</a>
      </li>
    );
  };

  return { default: MockFeedItem };
});

const posts = [
  { id: 1, title: 'First post' },
  { id: 2, title: 'Second post' },
  { id: 3, title: 'Third post' },
  { id: 4, title: 'Fourth post' }
];

const profilePostsElement = props => (
  <MemoryRouter>
    <ProfilePosts profileId={42} {...props} />
  </MemoryRouter>
);

const renderProfilePosts = props => render(profilePostsElement(props));

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

    renderProfilePosts();

    expect(useUserPosts).toHaveBeenCalledWith(42, undefined);
    const postItems = screen.getAllByTestId('profile-post');
    expect(postItems).toHaveLength(4);
    expect(postItems[0]).toHaveAttribute('data-priority-media', 'true');
    expect(postItems[1]).toHaveAttribute('data-priority-media', 'true');
    expect(postItems[2]).toHaveAttribute('data-priority-media', 'true');
    expect(postItems[3]).toHaveAttribute('data-priority-media', 'false');
    expect(screen.getAllByRole('link', { name: 'Photography tag' })[0])
      .toHaveAttribute('href', '/users/42?tag=photography');
    expect(screen.getByRole('heading', { name: 'Posts' }))
      .toHaveClass('visually-hidden');
  });

  it('announces the loading state', () => {
    useUserPosts.mockReturnValue({ isLoading: true });

    renderProfilePosts();

    expect(screen.getByRole('status')).toHaveTextContent('Loading posts…');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows the profile posts error without a retry action', () => {
    useUserPosts.mockReturnValue({ isError: true, isLoading: false });

    renderProfilePosts();

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

    renderProfilePosts();

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

    renderProfilePosts();
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

    renderProfilePosts();

    expect(screen.getByRole('button', { name: 'Loading posts...' })).toBeDisabled();
  });

  it('renders and focuses the profile-scoped filter state', () => {
    useUserPosts.mockReturnValue({
      data: { posts: [] },
      hasNextPage: false,
      isError: false,
      isLoading: false
    });

    renderProfilePosts({ tag: 'film_photography' });

    expect(useUserPosts).toHaveBeenCalledWith(42, 'film_photography');
    expect(screen.getByRole('heading', {
      name: 'Posts tagged #film_photography'
    })).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'No posts found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clear tag filter' })).toHaveAttribute(
      'href',
      '/users/42'
    );
  });

  it('moves focus when the active profile tag changes', () => {
    useUserPosts.mockReturnValue({
      data: { posts },
      hasNextPage: false,
      isError: false,
      isLoading: false
    });

    const { rerender } = renderProfilePosts({ tag: 'photography' });
    screen.getByRole('heading', { name: 'Posts tagged #photography' }).blur();

    rerender(profilePostsElement({ tag: 'sunset' }));

    expect(screen.getByRole('heading', { name: 'Posts tagged #sunset' })).toHaveFocus();
    expect(useUserPosts).toHaveBeenLastCalledWith(42, 'sunset');
  });

  it('returns focus to the hidden Posts heading when the filter clears', () => {
    useUserPosts.mockReturnValue({
      data: { posts },
      hasNextPage: false,
      isError: false,
      isLoading: false
    });

    const { rerender } = renderProfilePosts({ tag: 'photography' });

    rerender(profilePostsElement());

    expect(screen.getByRole('heading', { name: 'Posts' })).toHaveClass(
      'visually-hidden'
    );
    expect(screen.getByRole('heading', { name: 'Posts' })).toHaveFocus();
  });
});
