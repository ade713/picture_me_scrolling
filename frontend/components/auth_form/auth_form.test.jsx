import React from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useCurrentUser, useLogin, useSignup } from '../../query/session_hooks';
import AuthForm from './auth_form';

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn(),
  useLogin: vi.fn(),
  useSignup: vi.fn()
}));

const LocationPath = () => {
  const location = useLocation();

  return <span data-testid="location-path">{location.pathname}</span>;
};

const renderAuthForm = (path = '/') => (
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthForm />
      <LocationPath />
    </MemoryRouter>
  )
);

describe('AuthForm', () => {
  let loginMutation;
  let signupMutation;

  beforeEach(() => {
    loginMutation = {
      error: null,
      mutate: vi.fn()
    };
    signupMutation = {
      error: null,
      mutate: vi.fn()
    };

    useCurrentUser.mockReturnValue({ data: null });
    useLogin.mockReturnValue(loginMutation);
    useSignup.mockReturnValue(signupMutation);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders login mode by default', () => {
    renderAuthForm();

    expect(screen.getByRole('link', { name: 'Log In' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/signup');
  });

  it('renders signup mode on the signup route', () => {
    renderAuthForm('/signup');

    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/');
  });

  it('submits login credentials through the login mutation', async () => {
    const user = userEvent.setup();
    renderAuthForm();

    await user.type(screen.getByPlaceholderText('Your Username'), 'demo-user');
    await user.type(screen.getByPlaceholderText('Your Password'), 'password123');
    await user.click(screen.getByRole('link', { name: 'Log In' }));

    expect(loginMutation.mutate).toHaveBeenCalledWith({
      username: 'demo-user',
      password: 'password123'
    });
    expect(signupMutation.mutate).not.toHaveBeenCalled();
  });

  it('submits signup credentials through the signup mutation', async () => {
    const user = userEvent.setup();
    renderAuthForm('/signup');

    await user.type(screen.getByPlaceholderText('Your Username'), 'new-user');
    await user.type(screen.getByPlaceholderText('Your Password'), 'password123');
    await user.click(screen.getByRole('link', { name: 'Sign Up' }));

    expect(signupMutation.mutate).toHaveBeenCalledWith({
      username: 'new-user',
      password: 'password123'
    });
    expect(loginMutation.mutate).not.toHaveBeenCalled();
  });

  it('renders auth errors', () => {
    signupMutation.error = {
      errors: ['Username has already been taken']
    };

    renderAuthForm('/signup');

    expect(screen.getByText('Username has already been taken')).toBeInTheDocument();
  });

  it('redirects authenticated users to the dashboard', async () => {
    useCurrentUser.mockReturnValue({
      data: {
        id: 1,
        username: 'PicMeS Guest'
      }
    });

    renderAuthForm();

    await waitFor(() => {
      expect(screen.getByTestId('location-path')).toHaveTextContent('/dashboard');
    });
  });

  it('preserves guest login timing behavior', () => {
    vi.useFakeTimers();
    renderAuthForm();

    fireEvent.click(screen.getByRole('link', { name: 'Guest Log In' }));

    act(() => {
      vi.advanceTimersByTime(1700);
    });

    expect(loginMutation.mutate).toHaveBeenCalledWith({
      username: 'PicMeS Guest',
      password: '1Welcome2To3PicMeS'
    });
  });
});
