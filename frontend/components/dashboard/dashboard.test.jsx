import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useNavigate
} from 'react-router-dom';

import { ScrollRestorationProvider } from '../../util/scroll_restoration';
import Dashboard from './dashboard';

vi.mock('../feed/feed', () => ({
  default: ({ shouldFocusHeading, tag }) => (
    <p
      data-should-focus-heading={shouldFocusHeading}
      data-testid="dashboard-feed"
    >
      Active tag: {tag || 'none'}
    </p>
  )
}));

vi.mock('../users/recommended_users', () => ({
  default: () => <p>Recommended users</p>
}));

vi.mock('./account_menu', () => ({
  default: () => <p>Account menu</p>
}));

const HistoryControls = () => {
  const navigate = useNavigate();

  return (
    <>
      <button onClick={() => navigate('/dashboard?tag=sunset')}>Show sunset</button>
      <Link to="/users/42">
        Visit profile
      </Link>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
};

describe('Dashboard tag routing', () => {
  it('reads and normalizes the active tag from the URL', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard?tag=Film_Photography']}>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Active tag: film_photography')).toBeInTheDocument();
  });

  it('follows tag changes and browser history', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/dashboard?tag=photography']}>
        <HistoryControls />
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Active tag: photography')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show sunset' }));
    expect(screen.getByText('Active tag: sunset')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Active tag: photography')).toBeInTheDocument();
  });

  it('restores feed scroll position when returning through browser history', async () => {
    const user = userEvent.setup();
    let dashboardFeed;
    let dashboardMain;

    render(
      <MemoryRouter initialEntries={['/dashboard?tag=photography']}>
        <ScrollRestorationProvider>
          <HistoryControls />
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users/:id" element={<p>Profile page</p>} />
          </Routes>
        </ScrollRestorationProvider>
      </MemoryRouter>
    );

    dashboardFeed = document.querySelector('.dash-feed');
    dashboardMain = document.querySelector('.dash-main');
    dashboardFeed.scrollTop = 920;
    dashboardMain.scrollTop = 480;
    await user.click(screen.getByRole('link', { name: 'Visit profile' }));
    await user.click(screen.getByRole('button', { name: 'Back' }));

    await waitFor(() => {
      expect(document.querySelector('.dash-feed').scrollTop).toBe(920);
      expect(document.querySelector('.dash-main').scrollTop).toBe(480);
    });
    expect(screen.getByTestId('dashboard-feed')).toHaveAttribute(
      'data-should-focus-heading',
      'false'
    );
  });
});
