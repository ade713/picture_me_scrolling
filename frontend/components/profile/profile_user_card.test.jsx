import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import ProfileUserCard from './profile_user_card';

const relationshipUser = {
  id: 42,
  avatar_url: '/avatars/athos.png',
  followed_by_current_user: false,
  username: 'Athos'
};

const renderCard = (props = {}) => {
  const onFollow = vi.fn();
  const onUnfollow = vi.fn();

  render(
    <MemoryRouter>
      <ul>
        <ProfileUserCard
          currentUserId={1}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
          user={relationshipUser}
          {...props}
        />
      </ul>
    </MemoryRouter>
  );

  return { onFollow, onUnfollow };
};

describe('ProfileUserCard', () => {
  it('links the avatar and username to the canonical profile', () => {
    renderCard();

    expect(screen.getByRole('link', { name: 'Athos avatar' }))
      .toHaveAttribute('href', '/users/42');
    expect(screen.getByRole('link', { name: 'Athos' }))
      .toHaveAttribute('href', '/users/42');
  });

  it('follows a user who is not currently followed', async () => {
    const browserUser = userEvent.setup();
    const { onFollow, onUnfollow } = renderCard();
    const followButton = screen.getByRole('button', { name: 'Follow Athos' });

    expect(followButton).toHaveTextContent('Follow');
    expect(followButton).toHaveAttribute('title', 'Follow Athos');
    await browserUser.click(followButton);

    expect(onFollow).toHaveBeenCalledWith(42);
    expect(onUnfollow).not.toHaveBeenCalled();
  });

  it('unfollows a user who is currently followed', async () => {
    const browserUser = userEvent.setup();
    const { onFollow, onUnfollow } = renderCard({
      user: { ...relationshipUser, followed_by_current_user: true }
    });
    const unfollowButton = screen.getByRole('button', { name: 'Unfollow Athos' });

    expect(unfollowButton).toHaveTextContent('Unfollow');
    await browserUser.click(unfollowButton);

    expect(onUnfollow).toHaveBeenCalledWith(42);
    expect(onFollow).not.toHaveBeenCalled();
  });

  it('does not show a relationship action for the current user', () => {
    renderCard({ currentUserId: 42 });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('disables the relationship action while its mutation is pending', () => {
    renderCard({ relationshipPending: true });

    expect(screen.getByRole('button', { name: 'Follow Athos' })).toBeDisabled();
  });
});
