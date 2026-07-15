import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useFollowUser, useUsers } from '../../query/user_hooks';
import RecommendedUsers from './recommended_users';

vi.mock('../../query/user_hooks', () => ({
  useFollowUser: vi.fn(),
  useUsers: vi.fn()
}));

const recommendedUsers = [
  {
    id: 2,
    avatar_url: '/avatars/athos.png',
    username: 'Athos'
  },
  {
    id: 3,
    avatar_url: '/avatars/porthos.png',
    username: 'Porthos'
  }
];

describe('RecommendedUsers', () => {
  let followUser;

  beforeEach(() => {
    followUser = { mutate: vi.fn() };

    useFollowUser.mockReturnValue(followUser);
    useUsers.mockReturnValue({ data: recommendedUsers });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders an empty recommended users list gracefully', () => {
    useUsers.mockReturnValue({ data: [] });

    const { container } = render(<RecommendedUsers />);

    expect(screen.getByText('Recommended Users')).toBeInTheDocument();
    expect(container.querySelectorAll('.rec-user-item')).toHaveLength(0);
  });

  it('renders recommended users with avatars and usernames', () => {
    render(<RecommendedUsers />);

    recommendedUsers.forEach(user => {
      expect(screen.getByText(user.username)).toBeInTheDocument();
      expect(screen.getByAltText(`${user.username} avatar`)).toHaveAttribute(
        'src',
        user.avatar_url
      );
    });
  });

  it('calls follow mutation with the selected user id', async () => {
    const user = userEvent.setup();
    render(<RecommendedUsers />);

    const followButton = screen.getByRole('button', { name: `Follow ${recommendedUsers[1].username}` });

    expect(followButton).toHaveAttribute('title', `Follow ${recommendedUsers[1].username}`);

    await user.click(followButton);

    expect(followUser.mutate).toHaveBeenCalledWith(recommendedUsers[1].id);
  });
});
