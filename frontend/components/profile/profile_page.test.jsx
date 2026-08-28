import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';

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

vi.mock('./profile_posts', () => ({
  default: ({ profileId, shouldFocusHeading, tag }) => (
    <>
      <div
        data-should-focus-heading={shouldFocusHeading}
        data-testid="profile-posts"
      >
        Posts for profile {profileId}
      </div>
      <div data-testid="profile-posts-tag">{tag || 'unfiltered'}</div>
    </>
  )
}));

vi.mock('./profile_followers', () => ({
  default: ({ profileId, shouldFocusHeading }) => (
    <div
      data-should-focus-heading={shouldFocusHeading}
      data-testid="profile-followers"
    >
      Followers for profile {profileId}
    </div>
  )
}));

vi.mock('./profile_following', () => ({
  default: ({ profileId, shouldFocusHeading }) => (
    <div
      data-should-focus-heading={shouldFocusHeading}
      data-testid="profile-following"
    >
      Following for profile {profileId}
    </div>
  )
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

  return (
    <span data-testid="location-path">
      {location.pathname}{location.search}
    </span>
  );
};

const HistoryControls = () => {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate('/users/42?tag=photography')}
        type="button"
      >
        Select photography tag
      </button>
      <button onClick={() => navigate(-1)} type="button">History back</button>
      <button onClick={() => navigate(1)} type="button">History forward</button>
    </>
  );
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
    <HistoryControls />
  </MemoryRouter>
);

describe('ProfilePage', () => {
  let followUser;
  let scrollTo;
  let unfollowUser;

  beforeEach(() => {
    followUser = buildMutation();
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    unfollowUser = buildMutation();
    useCurrentUser.mockReturnValue({ data: { id: 1, username: 'Viewer' } });
    useFollowUser.mockReturnValue(followUser);
    useUnfollowUser.mockReturnValue(unfollowUser);
  });

  afterEach(() => {
    vi.clearAllMocks();
    scrollTo.mockRestore();
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
    expect(screen.getByRole('navigation', { name: 'Profile views' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Posts' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByText('Posts for profile 42')).toBeInTheDocument();
  });

  it('provides canonical links for each profile view', () => {
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute();

    expect(screen.getByRole('link', { name: 'Posts' })).toHaveAttribute(
      'href',
      routes.userProfile(42)
    );
    expect(screen.getByRole('link', { name: 'Followers' })).toHaveAttribute(
      'href',
      routes.userProfileView(42, 'followers')
    );
    expect(screen.getByRole('link', { name: 'Following' })).toHaveAttribute(
      'href',
      routes.userProfileView(42, 'following')
    );
  });

  it('restores a direct Followers URL while preserving the profile header', () => {
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute('/users/42?view=followers');

    expect(screen.getByRole('heading', { name: 'Athos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Followers' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/users/42?view=followers'
    );
    expect(screen.getByTestId('profile-followers')).toHaveTextContent(
      'Followers for profile 42'
    );
    expect(screen.queryByText('Posts for profile 42')).not.toBeInTheDocument();
  });

  it('restores a direct Following URL while preserving the profile header', () => {
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute('/users/42?view=following');

    expect(screen.getByRole('heading', { name: 'Athos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Following' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/users/42?view=following'
    );
    expect(screen.getByTestId('profile-following')).toHaveTextContent(
      'Following for profile 42'
    );
    expect(screen.queryByText('Posts for profile 42')).not.toBeInTheDocument();
  });

  it('switches views through ordinary links and returns to canonical Posts', async () => {
    const user = userEvent.setup();
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute('/users/42?tag=photography');
    await user.click(screen.getByRole('link', { name: 'Following' }));

    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/users/42?view=following'
    );
    expect(screen.getByRole('link', { name: 'Following' })).toHaveAttribute(
      'aria-current',
      'page'
    );

    await user.click(screen.getByRole('link', { name: 'Posts' }));

    expect(screen.getByTestId('location-path')).toHaveTextContent('/users/42');
    expect(screen.getByRole('link', { name: 'Posts' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('restores profile views with browser Back and Forward navigation', async () => {
    const user = userEvent.setup();
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute();
    await user.click(screen.getByRole('link', { name: 'Followers' }));
    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/users/42?view=followers'
    );

    await user.click(screen.getByRole('button', { name: 'History back' }));
    expect(screen.getByTestId('location-path')).toHaveTextContent('/users/42');
    expect(screen.getByRole('link', { name: 'Posts' })).toHaveAttribute(
      'aria-current',
      'page'
    );

    await user.click(screen.getByRole('button', { name: 'History forward' }));
    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/users/42?view=followers'
    );
    expect(screen.getByRole('link', { name: 'Followers' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('restores a profile view scroll position without moving heading focus', async () => {
    const user = userEvent.setup();
    let currentScrollY = 0;
    const scrollY = vi.spyOn(window, 'scrollY', 'get').mockImplementation(
      () => currentScrollY
    );
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute();

    currentScrollY = 480;
    await user.click(screen.getByRole('link', { name: 'Followers' }));
    currentScrollY = 920;
    await user.click(screen.getByRole('link', { name: 'Following' }));
    currentScrollY = 1320;
    await user.click(screen.getByRole('button', { name: 'History back' }));

    await waitFor(() => {
      expect(scrollTo).toHaveBeenLastCalledWith({
        behavior: 'auto',
        left: 0,
        top: 920
      });
    });
    expect(screen.getByTestId('profile-followers')).toHaveAttribute(
      'data-should-focus-heading',
      'false'
    );

    scrollY.mockRestore();
  });

  it('restores profile tag filters with browser Back and Forward navigation', async () => {
    const user = userEvent.setup();
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute();
    await user.click(screen.getByRole('button', { name: 'Select photography tag' }));
    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/users/42?tag=photography'
    );
    expect(screen.getByTestId('profile-posts-tag')).toHaveTextContent('photography');

    await user.click(screen.getByRole('button', { name: 'History back' }));
    expect(screen.getByTestId('location-path')).toHaveTextContent('/users/42');
    expect(screen.getByTestId('profile-posts-tag')).toHaveTextContent('unfiltered');

    await user.click(screen.getByRole('button', { name: 'History forward' }));
    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/users/42?tag=photography'
    );
    expect(screen.getByTestId('profile-posts-tag')).toHaveTextContent('photography');
  });

  it('removes a conflicting tag from non-Posts view URLs', async () => {
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute('/users/42?view=followers&tag=photography');

    await waitFor(() => {
      expect(screen.getByTestId('location-path')).toHaveTextContent(
        '/users/42?view=followers'
      );
    });
  });

  it('normalizes unsupported views to Posts while retaining its tag', async () => {
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute('/users/42?view=unknown&tag=photography');

    await waitFor(() => {
      expect(screen.getByTestId('location-path')).toHaveTextContent(
        '/users/42?tag=photography'
      );
    });
    expect(screen.getByRole('link', { name: 'Posts' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByTestId('profile-posts-tag')).toHaveTextContent('photography');
  });

  it('normalizes a profile tag before loading filtered posts', async () => {
    useUser.mockReturnValue(buildProfileQuery({ data: buildProfile() }));

    renderProfileRoute('/users/42?tag=%20Film_Photography%20');

    await waitFor(() => {
      expect(screen.getByTestId('location-path')).toHaveTextContent(
        '/users/42?tag=film_photography'
      );
    });
    expect(screen.getByTestId('profile-posts-tag')).toHaveTextContent(
      'film_photography'
    );
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
    expect(screen.getByRole('status')).toHaveClass(
      'loading-indicator--large'
    );
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
