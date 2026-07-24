import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';

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

  const RouteChanger = () => {
    const navigate = useNavigate();

    return (
      <button type="button" onClick={ () => navigate('/another-route') }>
        Change route
      </button>
    );
  };

  const renderMenu = ({
    withOutsideControl = false,
    withRouteChanger = false
  } = {}) => render(
    <MemoryRouter>
      <AccountMenu />
      { withOutsideControl && <button type="button">Outside control</button> }
      { withRouteChanger && <RouteChanger /> }
    </MemoryRouter>
  );

  it('uses the current username as the collapsed menu trigger', () => {
    renderMenu();

    const trigger = screen.getByRole('button', { name: 'Athos' });
    const popup = document.getElementById('dashboard-account-menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveClass('account-menu-trigger');
    expect(popup).toHaveClass('account-menu-popup');
    expect(popup).toHaveAttribute('hidden');
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('opens the account controls and links to settings', async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByRole('button', { name: 'Athos' });
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('dashboard-account-menu')).not.toHaveAttribute('hidden');
    const settingsLink = screen.getByRole('link', { name: 'Settings' });
    expect(settingsLink).toHaveAttribute(
      'href',
      '/settings'
    );
    expect(screen.getByRole('button', { name: 'Log Out' })).toBeInTheDocument();

    await user.click(settingsLink);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens through native keyboard button behavior', async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByRole('button', { name: 'Athos' });
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  it('opens with Space through native keyboard button behavior', async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByRole('button', { name: 'Athos' });
    trigger.focus();
    await user.keyboard(' ');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  it('tabs through Settings and Log Out in document order', async () => {
    const user = userEvent.setup();
    renderMenu({ withOutsideControl: true });

    await user.click(screen.getByRole('button', { name: 'Athos' }));
    await user.tab();
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Log Out' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Outside control' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Athos' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    renderMenu();

    const trigger = screen.getByRole('button', { name: 'Athos' });
    await user.click(trigger);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('closes when the user clicks outside the account menu', async () => {
    const user = userEvent.setup();
    renderMenu({ withOutsideControl: true });

    const trigger = screen.getByRole('button', { name: 'Athos' });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Outside control' }));

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('closes when the current route changes', async () => {
    const user = userEvent.setup();
    renderMenu({ withRouteChanger: true });

    const trigger = screen.getByRole('button', { name: 'Athos' });
    await user.click(trigger);
    // A click without pointer events isolates route dismissal from outside-click dismissal.
    fireEvent.click(screen.getByRole('button', { name: 'Change route' }));

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
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
