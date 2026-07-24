import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { useCurrentUser, useLogout } from '../../query/session_hooks';
import AccountMenu from './account_menu';

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn(),
  useLogout: vi.fn()
}));

describe('AccountMenu', () => {
  let logout;

  beforeEach(() => {
    logout = {
      isPending: false,
      mutate: vi.fn()
    };
    useCurrentUser.mockReturnValue({
      data: { id: 1, username: 'Athos' }
    });
    useLogout.mockReturnValue(logout);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderMenu = () => render(
    <MemoryRouter>
      <AccountMenu />
    </MemoryRouter>
  );

  it('uses the current username as the collapsed menu trigger', () => {
    renderMenu();

    const trigger = screen.getByRole('button', { name: 'Athos' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('opens the account controls and links to settings', async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByRole('button', { name: 'Athos' });
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings'
    );
    expect(screen.getByRole('button', { name: 'Log Out' })).toBeInTheDocument();
  });

  it('closes the menu and runs the existing logout mutation', async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByRole('button', { name: 'Athos' });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Log Out' }));

    expect(logout.mutate).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Log Out' })).not.toBeInTheDocument();
  });
});
