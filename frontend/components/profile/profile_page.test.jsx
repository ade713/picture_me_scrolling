import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { routes } from '../../config/routes';
import { useCurrentUser } from '../../query/session_hooks';
import { useUser } from '../../query/user_hooks';
import { ProtectedRoute } from '../../util/route_util';
import ProfilePage from './profile_page';

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

vi.mock('../../query/user_hooks', () => ({
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
  beforeEach(() => {
    useCurrentUser.mockReturnValue({ data: { id: 1, username: 'Viewer' } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads and renders identity for the route user', () => {
    useUser.mockReturnValue(buildProfileQuery({
      data: {
        id: 42,
        username: 'Athos',
        avatar_url: '/avatars/athos.png'
      }
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
