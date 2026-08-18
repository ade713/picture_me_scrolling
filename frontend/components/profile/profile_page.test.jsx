import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { routes } from '../../config/routes';
import { useCurrentUser } from '../../query/session_hooks';
import { useFollowUser, useUnfollowUser, useUser } from '../../query/user_hooks';
import { ProtectedRoute } from '../../util/route_util';
import ProfilePage from './profile_page';

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

vi.mock('../../query/user_hooks', () => ({
  useFollowUser: vi.fn(),
  useUnfollowUser: vi.fn(),
  useUser: vi.fn()
}));

vi.mock('../dashboard/account_menu', () => ({
  default: () => <div>Account menu</div>
}));

const buildProfileQuery = (overrides = {}) => ({
  data: null,
  error: null,
  isError: false,
  isPending: false,
  ...overrides
});

const buildMutation = (overrides = {}) => ({
  isPending: false,
  mutate: vi.fn(),
  ...overrides
});

const buildProfile = (overrides = {}) => ({
  id: 42,
  username: 'Athos',
  avatar_url: '/avatars/athos.png',
  follower_count: 12,
  following_count: 8,
  followed_by_current_user: false,
  ...overrides
});

const LocationPath = () => {
  const location = useLocation();

  return <span data-testid="location-path">{location.pathname}</span>;
};

const renderProfileRoute = (path = routes.userProfile(42)) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route
        path={routes.profile}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path={routes.home} element={<p>Log in</p>} />
      <Route path={routes.dashboard} element={<p>Dashboard</p>} />
    </Routes>
    <LocationPath />
  </MemoryRouter>
);

describe('ProfilePage', () => {
  let followUser;
  let unfollowUser;

  beforeEach(() => {
    followUser = buildMutation();
    unfollowUser = buildMutation();
    useCurrentUser.mockReturnValue({ data: { id: 1, username: 'Viewer' } });
    useFollowUser.mockReturnValue(followUser);
    useUnfollowUser.mockReturnValue(unfollowUser);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads and renders identity for the route user', () => {
    useUser.mockReturnValue(buildProfileQuery({
      data: buildProfile()
    }));

    renderProfileRoute();

    expect(useUser).toHaveBeenCalledWith('42');
    expect(screen.getByRole('heading', { name: 'Athos' })).toBeInTheDocument();
    expect(screen.getByAltText('Athos avatar')).toHaveAttribute(
      'src',
      '/avatars/athos.png'
    );
    expect(screen.getByRole('link', { name: 'PicMeS' })).toHaveAttribute(
      'href',
      routes.dashboard
    );
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute(
      'href',
      routes.dashboard
    );
    expect(screen.getByRole('button', { name: 'Follow Athos' })).toBeEnabled();
  });

  it('shows compact counts while preserving exact accessible labels', () => {
    useUser.mockReturnValue(buildProfileQuery({
      data: buildProfile({ follower_count: 1247, following_count: 18000 })
    }));

    renderProfileRoute();

    expect(screen.getByText('1.2K followers')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('18K following')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('1,247 followers')).toHaveClass('profile-count-exact');
    expect(screen.getByText('18,000 following')).toHaveClass('profile-count-exact');
    expect(screen.getByTitle('1,247 followers')).toBeInTheDocument();
  });

  it('links to Settings instead of showing a relationship action on your profile', () => {
    useCurrentUser.mockReturnValue({ data: { id: 42, username: 'Athos' } });
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute();

    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      routes.settings
    );
    expect(screen.queryByRole('button', { name: /Follow|Unfollow/ })).not.toBeInTheDocument();
  });

  it('follows another user', async () => {
    const user = userEvent.setup();
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute();
    await user.click(screen.getByRole('button', { name: 'Follow Athos' }));

    expect(followUser.mutate).toHaveBeenCalledWith(42);
    expect(unfollowUser.mutate).not.toHaveBeenCalled();
  });

  it('disables the relationship action while a mutation is pending', () => {
    useFollowUser.mockReturnValue(buildMutation({ isPending: true }));
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute();

    const followButton = screen.getByRole('button', { name: 'Follow Athos' });
    expect(followButton).toBeDisabled();
  });

  it('unfollows another user when the relationship already exists', async () => {
    const user = userEvent.setup();
    useUser.mockReturnValue(buildProfileQuery({
      data: buildProfile({ followed_by_current_user: true })
    }));

    renderProfileRoute();
    await user.click(screen.getByRole('button', { name: 'Unfollow Athos' }));

    expect(unfollowUser.mutate).toHaveBeenCalledWith(42);
    expect(followUser.mutate).not.toHaveBeenCalled();
  });

  it('announces the loading state without rendering profile identity', () => {
    useUser.mockReturnValue(buildProfileQuery({ isPending: true }));

    renderProfileRoute();

    expect(screen.getByRole('status')).toHaveTextContent('Loading profile…');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders the not-found state for an unknown user', () => {
    useUser.mockReturnValue(buildProfileQuery({
      error: { status: 404 },
      isError: true
    }));

    renderProfileRoute('/users/9999');

    expect(screen.getByRole('alert')).toHaveTextContent('User not found');
    expect(screen.getByRole('heading', { name: 'User not found' })).toBeInTheDocument();
  });

  it('renders a generic profile error without exposing API details', () => {
    useUser.mockReturnValue(buildProfileQuery({
      error: { status: 500, message: 'Internal Server Error' },
      isError: true
    }));

    renderProfileRoute();

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load profile.');
    expect(screen.queryByText('Internal Server Error')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated visitors to login', async () => {
    useCurrentUser.mockReturnValue({ data: null });
    useUser.mockReturnValue(buildProfileQuery());

    renderProfileRoute();

    await waitFor(() => {
      expect(screen.getByTestId('location-path')).toHaveTextContent(routes.home);
    });
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(useUser).not.toHaveBeenCalled();
  });
});
