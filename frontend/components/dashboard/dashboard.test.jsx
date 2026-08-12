import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import Dashboard from './dashboard';

vi.mock('../feed/feed', () => ({
  default: ({ tag }) => <p>Active tag: {tag || 'none'}</p>
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
});
