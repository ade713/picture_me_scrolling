import React from 'react';
import { render } from '@testing-library/react';

import FeedItem from '../components/feed/feed_item';

export const basePost = {
  id: 10,
  author: 'Athos',
  author_avatar: '/avatars/athos.png',
  author_id: 2,
  body: 'One for all',
  followed: false,
  image_url: '/uploads/post-media.png',
  liked: false,
  likes: 4,
  post_type: 'text',
  title: 'All for one',
  url: 'https://example.com'
};

export const createFeedItemMutations = () => ({
  deletePost: { mutate: vi.fn() },
  followUser: { mutate: vi.fn() },
  likePost: { mutate: vi.fn() },
  unfollowUser: { mutate: vi.fn() },
  unlikePost: { mutate: vi.fn() },
  updatePost: {
    error: null,
    mutateAsync: vi.fn().mockResolvedValue({ ...basePost, title: 'Updated title' }),
    reset: vi.fn()
  }
});

export const feedItemElement = post => (
  <ul>
    <FeedItem post={{ ...basePost, ...post }} />
  </ul>
);

export const renderFeedItem = post => render(feedItemElement(post));
