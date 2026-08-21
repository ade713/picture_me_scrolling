import { screen } from '@testing-library/react';

import { useDeletePost, useLikePost, useUnlikePost } from '../../query/post_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import { basePost, createFeedItemMutations, renderFeedItem } from '../../test/feed_item_helpers';
import { currentUser } from '../../test/fixtures';
import { useFollowUser, useUnfollowUser } from '../../query/user_hooks';

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
      expect(container.querySelector('.post-upload-audio audio')).toBeInTheDocument();
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

describe('FeedItem post bodies', () => {
  beforeEach(() => {
    const { deletePost, followUser, likePost, unfollowUser, unlikePost } = createFeedItemMutations();

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

      expect(screen.getByRole('link', { name: 'Athos' })).toHaveAttribute(
        'href',
        '/users/2'
      );
      expect(screen.getByRole('link', { name: "View Athos's profile" }))
        .toHaveAttribute('href', '/users/2');
      expect(screen.getByRole('link', { name: "View Athos's profile" })
        .querySelector('img')).toHaveAttribute('src', '/avatars/athos.png');
      expect(screen.getByText(`Likes: ${basePost.likes}`)).toBeInTheDocument();
      assertions(container);
    });
  });

  it('displays tags between post content and the footer', () => {
    const { container } = renderFeedItem();
    const tags = screen.getByRole('list', { name: 'Tags' });

    expect(tags).toHaveTextContent('#photography');
    expect(tags).toHaveTextContent('#sunset');
    expect(screen.getByRole('link', { name: '#photography' })).toHaveAttribute(
      'href',
      '/dashboard?tag=photography'
    );
    expect(container.querySelector('.post-tags + .post-footer')).toBeInTheDocument();
  });

  it('omits the tag list when a post has no tags', () => {
    renderFeedItem({ tags: [] });

    expect(screen.queryByRole('list', { name: 'Tags' })).not.toBeInTheDocument();
  });

  it('uses a provided tag destination without changing tag rendering', () => {
    renderFeedItem({}, {
      tagDestination: tag => `/users/42?tag=${tag}`
    });

    expect(screen.getByRole('link', { name: '#photography' })).toHaveAttribute(
      'href',
      '/users/42?tag=photography'
    );
    expect(screen.getByRole('link', { name: '#sunset' })).toHaveAttribute(
      'href',
      '/users/42?tag=sunset'
    );
  });
});
