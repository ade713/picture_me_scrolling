import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import {
  useFollowUser,
  useUnfollowUser,
  useUserFollowing
} from '../../query/user_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import ProfileFollowing from './profile_following';

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

vi.mock('../../query/user_hooks', () => ({
  useFollowUser: vi.fn(),
  useUnfollowUser: vi.fn(),
  useUserFollowing: vi.fn()
}));

const buildMutation = () => ({
  isPending: false,
  mutate: vi.fn(),
  variables: undefined
});

const renderFollowing = () => render(
  <MemoryRouter>
    <ProfileFollowing profileId={42} />
  </MemoryRouter>
);

describe('ProfileFollowing', () => {
  beforeEach(() => {
    useCurrentUser.mockReturnValue({ data: { id: 1, username: 'Viewer' } });
    useFollowUser.mockReturnValue(buildMutation());
    useUnfollowUser.mockReturnValue(buildMutation());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders followed-user cards and focuses the view heading', () => {
    useUserFollowing.mockReturnValue({
      data: {
        users: [{
          id: 2,
          avatar_url: '/avatars/athos.png',
          followed_by_current_user: true,
          username: 'Athos'
        }]
      },
      hasNextPage: false,
      isError: false,
      isLoading: false
    });

    renderFollowing();

    expect(useUserFollowing).toHaveBeenCalledWith(42);
    expect(screen.getByRole('heading', { name: 'Following' })).toHaveFocus();
    expect(screen.getByRole('link', { name: 'Athos' })).toHaveAttribute(
      'href',
      '/users/2'
    );
    expect(screen.getByRole('button', { name: 'Unfollow Athos' })).toBeEnabled();
  });

  it('uses Following-specific loading, error, and empty messages', () => {
    // Show the view-specific message while the initial request is pending.
    useUserFollowing.mockReturnValue({ isLoading: true });
    const { rerender } = renderFollowing();

    expect(screen.getByRole('status')).toHaveTextContent('Loading following…');
    expect(screen.getByRole('status')).toHaveClass(
      'loading-indicator--large'
    );

    // Replace the loading state with the view-specific request error.
    useUserFollowing.mockReturnValue({ isError: true, isLoading: false });
    rerender(
      <MemoryRouter>
        <ProfileFollowing profileId={42} />
      </MemoryRouter>
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load following.'
    );

    // Replace the error with the empty state returned by a successful request.
    useUserFollowing.mockReturnValue({
      data: { users: [] },
      hasNextPage: false,
      isError: false,
      isLoading: false
    });
    rerender(
      <MemoryRouter>
        <ProfileFollowing profileId={42} />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Not following anyone yet' }))
      .toBeInTheDocument();
  });
});
