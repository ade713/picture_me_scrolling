import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import {
  useFollowUser,
  useUnfollowUser,
  useUserFollowers
} from '../../query/user_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import ProfileFollowers from './profile_followers';

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

vi.mock('../../query/user_hooks', () => ({
  useFollowUser: vi.fn(),
  useUnfollowUser: vi.fn(),
  useUserFollowers: vi.fn()
}));

const followers = [
  {
    id: 1,
    avatar_url: '/avatars/viewer.png',
    followed_by_current_user: false,
    username: 'Viewer'
  },
  {
    id: 2,
    avatar_url: '/avatars/athos.png',
    followed_by_current_user: false,
    username: 'Athos'
  }
];

const buildMutation = (overrides = {}) => ({
  isPending: false,
  mutate: vi.fn(),
  variables: undefined,
  ...overrides
});

const renderFollowers = () => render(
  <MemoryRouter>
    <ProfileFollowers profileId={42} />
  </MemoryRouter>
);

describe('ProfileFollowers', () => {
  let followUser;
  let unfollowUser;

  beforeEach(() => {
    followUser = buildMutation();
    unfollowUser = buildMutation();
    useFollowUser.mockReturnValue(followUser);
    useCurrentUser.mockReturnValue({ data: { id: 1, username: 'Viewer' } });
    useUnfollowUser.mockReturnValue(unfollowUser);
    useUserFollowers.mockReturnValue({
      data: { users: followers },
      hasNextPage: false,
      isError: false,
      isLoading: false
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders linked follower cards and focuses the view heading', () => {
    renderFollowers();

    expect(useUserFollowers).toHaveBeenCalledWith(42);
    expect(screen.getByRole('heading', { name: 'Followers' })).toHaveFocus();
    expect(screen.getByRole('link', { name: 'Athos' })).toHaveAttribute(
      'href',
      '/users/2'
    );
    expect(screen.queryByRole('button', { name: 'Follow Viewer' }))
      .not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Follow Athos' })).toBeEnabled();
  });

  it('announces the loading state', () => {
    useUserFollowers.mockReturnValue({ isLoading: true });

    renderFollowers();

    expect(screen.getByRole('status')).toHaveTextContent('Loading followers…');
    expect(screen.getByRole('status')).toHaveClass(
      'pagination-loading-indicator--initial'
    );
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows the followers error without a retry action', () => {
    useUserFollowers.mockReturnValue({ isError: true, isLoading: false });

    renderFollowers();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load followers.'
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the empty followers state', () => {
    useUserFollowers.mockReturnValue({
      data: { users: [] },
      hasNextPage: false,
      isError: false,
      isLoading: false
    });

    renderFollowers();

    expect(screen.getByRole('heading', { name: 'No followers yet' }))
      .toBeInTheDocument();
  });

  it('loads the next followers page', async () => {
    const browserUser = userEvent.setup();
    const fetchNextPage = vi.fn();
    useUserFollowers.mockReturnValue({
      data: { users: followers },
      fetchNextPage,
      hasNextPage: true,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false
    });

    renderFollowers();
    await browserUser.click(screen.getByRole('button', {
      name: 'Load more followers'
    }));

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('disables the pagination action while the next page loads', () => {
    useUserFollowers.mockReturnValue({
      data: { users: followers },
      hasNextPage: true,
      isError: false,
      isFetchingNextPage: true,
      isLoading: false
    });

    renderFollowers();

    expect(screen.getByRole('button', { name: 'Loading more followers…' }))
      .toBeDisabled();
  });

  it('keeps followers visible and retries a failed next page', async () => {
    const browserUser = userEvent.setup();
    const fetchNextPage = vi.fn();
    useUserFollowers.mockReturnValue({
      data: { users: followers },
      fetchNextPage,
      hasNextPage: true,
      isError: true,
      isFetchNextPageError: true,
      isFetchingNextPage: false,
      isLoading: false
    });

    renderFollowers();

    expect(screen.getByRole('link', { name: 'Athos' })).toBeInTheDocument();
    await browserUser.click(screen.getByRole('button', {
      name: 'Retry loading'
    }));

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('disables the relationship action for the pending user', () => {
    followUser = buildMutation({ isPending: true, variables: 2 });
    useFollowUser.mockReturnValue(followUser);

    renderFollowers();

    expect(screen.getByRole('button', { name: 'Follow Athos' })).toBeDisabled();
  });

  it('runs a follower relationship action', async () => {
    const browserUser = userEvent.setup();

    renderFollowers();
    await browserUser.click(screen.getByRole('button', { name: 'Follow Athos' }));

    expect(followUser.mutate).toHaveBeenCalledWith(2);
  });
});
