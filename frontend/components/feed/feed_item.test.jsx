import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useDeletePost, useLikePost, useUnlikePost } from '../../query/post_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import { currentUser } from '../../test/fixtures';
import { useFollowUser, useUnfollowUser } from '../../query/user_hooks';
import FeedItem from './feed_item';

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

vi.mock('../../query/post_hooks', () => ({
  useDeletePost: vi.fn(),
  useLikePost: vi.fn(),
  useUnlikePost: vi.fn()
}));

vi.mock('../../query/user_hooks', () => ({
  useFollowUser: vi.fn(),
  useUnfollowUser: vi.fn()
}));

const basePost = {
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

const renderFeedItem = post => (
  render(
    <ul>
      <FeedItem post={{ ...basePost, ...post }} />
    </ul>
  )
);

const bodyCases = [
  {
    assertions: () => {
      expect(screen.getByText('All for one')).toBeInTheDocument();
      expect(screen.getByText('One for all')).toBeInTheDocument();
    },
    post: { post_type: 'text' }
  },
  {
    assertions: () => {
      expect(screen.getByRole('link', { name: 'All for one' })).toHaveAttribute(
        'href',
        'https://example.com'
      );
    },
    post: { post_type: 'link' }
  },
  {
    assertions: () => {
      expect(screen.getByAltText('All for one')).toHaveAttribute('src', '/uploads/post-media.png');
    },
    post: { post_type: 'photo' }
  },
  {
    assertions: () => {
      expect(screen.getByText('All for one')).toBeInTheDocument();
      expect(screen.getByText('One for all')).toBeInTheDocument();
    },
    post: { post_type: 'quote' }
  },
  {
    assertions: container => {
      expect(container.querySelector('.post-upload-audio source')).toHaveAttribute(
        'src',
        '/uploads/post-media.png'
      );
      expect(screen.getByText('All for one')).toBeInTheDocument();
    },
    post: { post_type: 'audio' }
  },
  {
    assertions: container => {
      expect(container.querySelector('.post-upload-video source')).toHaveAttribute(
        'src',
        '/uploads/post-media.png'
      );
      expect(screen.getByText('All for one')).toBeInTheDocument();
    },
    post: { post_type: 'video' }
  }
];

describe('FeedItem', () => {
  let deletePost;
  let followUser;
  let likePost;
  let unfollowUser;
  let unlikePost;

  beforeEach(() => {
    deletePost = { mutate: vi.fn() };
    followUser = { mutate: vi.fn() };
    likePost = { mutate: vi.fn() };
    unfollowUser = { mutate: vi.fn() };
    unlikePost = { mutate: vi.fn() };

    useCurrentUser.mockReturnValue({ data: currentUser });
    useDeletePost.mockReturnValue(deletePost);
    useFollowUser.mockReturnValue(followUser);
    useLikePost.mockReturnValue(likePost);
    useUnfollowUser.mockReturnValue(unfollowUser);
    useUnlikePost.mockReturnValue(unlikePost);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  bodyCases.forEach(({ assertions, post }) => {
    it(`renders ${post.post_type} post content`, () => {
      const { container } = renderFeedItem(post);

      expect(screen.getByText('Athos')).toBeInTheDocument();
      expect(screen.getByAltText('Athos avatar')).toHaveAttribute('src', '/avatars/athos.png');
      expect(screen.getByText(`Likes: ${basePost.likes}`)).toBeInTheDocument();
      assertions(container);
    });
  });

  it('calls follow and unfollow mutations with the author id', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ul>
        <FeedItem post={{ ...basePost, followed: false }} />
      </ul>
    );

    await user.click(screen.getByRole('button', { name: 'Follow' }));

    expect(followUser.mutate).toHaveBeenCalledWith(basePost.author_id);

    rerender(
      <ul>
        <FeedItem post={{ ...basePost, followed: true }} />
      </ul>
    );

    await user.click(screen.getByRole('button', { name: 'Unfollow' }));

    expect(unfollowUser.mutate).toHaveBeenCalledWith(basePost.author_id);
  });

  it('calls like and unlike mutations with the post id', async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(
      <ul>
        <FeedItem post={{ ...basePost, liked: false }} />
      </ul>
    );

    await user.click(container.querySelector('.like-btn-off'));

    expect(likePost.mutate).toHaveBeenCalledWith(basePost.id);

    rerender(
      <ul>
        <FeedItem post={{ ...basePost, liked: true }} />
      </ul>
    );

    await user.click(container.querySelector('.like-btn-on'));

    expect(unlikePost.mutate).toHaveBeenCalledWith(basePost.id);
  });

  it('shows delete controls only for the current user posts', async () => {
    const user = userEvent.setup();
    const authoredPost = {
      ...basePost,
      author_id: currentUser.id
    };
    const { container, rerender } = render(
      <ul>
        <FeedItem post={authoredPost} />
      </ul>
    );

    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument();
    expect(container.querySelector('.like-btn-off')).not.toBeInTheDocument();
    expect(container.querySelector('.delete-post-btn')).toBeInTheDocument();

    await user.click(container.querySelector('.delete-post-btn'));

    expect(deletePost.mutate).toHaveBeenCalledWith(authoredPost);

    rerender(
      <ul>
        <FeedItem post={basePost} />
      </ul>
    );

    expect(container.querySelector('.delete-post-btn')).not.toBeInTheDocument();
  });
});
