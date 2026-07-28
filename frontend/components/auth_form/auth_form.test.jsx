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
      mutate: vi.fn(),
      reset: vi.fn()
    };
    signupMutation = {
      error: null,
      mutate: vi.fn(),
      reset: vi.fn()
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

    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/signup');
  });

  it('renders signup mode on the signup route', () => {
    renderAuthForm('/signup');

    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('labels social profile links', () => {
    renderAuthForm();

    expect(screen.getByRole('link', { name: 'GitHub profile' })).toHaveAttribute('title', 'GitHub profile');
    expect(screen.getByRole('link', { name: 'LinkedIn profile' })).toHaveAttribute('title', 'LinkedIn profile');
  });

  it('reaches the auth controls in a logical keyboard order', async () => {
    const user = userEvent.setup();

    renderAuthForm();

    await user.tab();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Username' })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Password')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Log In' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Guest Log In' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'GitHub profile' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'LinkedIn profile' })).toHaveFocus();
  });

  it('submits login credentials through the login mutation', async () => {
    const user = userEvent.setup();
    renderAuthForm();

    await user.type(screen.getByPlaceholderText('Your Username'), 'demo-user');
    await user.type(screen.getByPlaceholderText('Your Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log In' }));

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
    await user.type(screen.getByPlaceholderText('Your Email'), 'new-user@example.com');
    await user.type(screen.getByPlaceholderText('Your Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(signupMutation.mutate).toHaveBeenCalledWith({
      username: 'new-user',
      email: 'new-user@example.com',
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

  it('dedupes repeated login errors', () => {
    loginMutation.error = {
      errors: ['Invalid username or password']
    };

    renderAuthForm();

    expect(screen.getAllByText('Invalid username or password')).toHaveLength(1);
  });

  it('clears stale auth errors when switching auth modes', async () => {
    const user = userEvent.setup();
    loginMutation.error = {
      errors: ['Invalid username or password']
    };

    renderAuthForm();
    loginMutation.reset.mockClear();
    signupMutation.reset.mockClear();

    await user.click(screen.getByRole('link', { name: 'Sign Up' }));

    expect(loginMutation.reset).toHaveBeenCalledTimes(1);
    expect(signupMutation.reset).toHaveBeenCalledTimes(1);
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

  it('applies the shared password length guidance during signup', () => {
    renderAuthForm('/signup');

    expect(screen.getByLabelText('Password')).toHaveAttribute('minlength', '6');
    expect(screen.getByLabelText('Password')).toHaveAttribute('maxlength', '64');
  });

  it('preserves guest login timing behavior', () => {
    vi.useFakeTimers();
    renderAuthForm();

    fireEvent.click(screen.getByRole('button', { name: 'Guest Log In' }));

    act(() => {
      vi.advanceTimersByTime(1700);
    });

    expect(loginMutation.mutate).toHaveBeenCalledWith({
      username: 'PicMeS Guest',
      password: '1Welcome2To3PicMeS'
    });
  });
});
