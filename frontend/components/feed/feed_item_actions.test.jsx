import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useDeletePost, useLikePost, useUnlikePost } from '../../query/post_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import { basePost,
         createFeedItemMutations,
         feedItemElement,
         renderFeedItem } from '../../test/feed_item_helpers';
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

describe('FeedItem actions', () => {
  let deletePost;
  let followUser;
  let likePost;
  let unfollowUser;
  let unlikePost;

  beforeEach(() => {
    ({ deletePost, followUser, likePost, unfollowUser, unlikePost } = createFeedItemMutations());

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

  it('calls follow and unfollow mutations with the author id', async () => {
    const user = userEvent.setup();
    const { rerender } = renderFeedItem({ followed: false });

    await user.click(screen.getByRole('button', { name: 'Follow' }));

    expect(followUser.mutate).toHaveBeenCalledWith(basePost.author_id);

    rerender(feedItemElement({ followed: true }));

    await user.click(screen.getByRole('button', { name: 'Unfollow' }));

    expect(unfollowUser.mutate).toHaveBeenCalledWith(basePost.author_id);
  });

  it('calls like and unlike mutations with the post id', async () => {
    const user = userEvent.setup();
    const { container, rerender } = renderFeedItem({ liked: false });

    await user.click(container.querySelector('.like-btn-off'));

    expect(likePost.mutate).toHaveBeenCalledWith(basePost.id);

    rerender(feedItemElement({ liked: true }));

    await user.click(container.querySelector('.like-btn-on'));

    expect(unlikePost.mutate).toHaveBeenCalledWith(basePost.id);
  });

  it('shows delete controls only for the current user posts', async () => {
    const user = userEvent.setup();
    const authoredPost = {
      ...basePost,
      author_id: currentUser.id
    };
    const { container, rerender } = renderFeedItem(authoredPost);

    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument();
    expect(container.querySelector('.like-btn-off')).not.toBeInTheDocument();
    expect(container.querySelector('.delete-post-btn')).toBeInTheDocument();

    await user.click(container.querySelector('.delete-post-btn'));

    expect(deletePost.mutate).toHaveBeenCalledWith(authoredPost);

    rerender(feedItemElement(basePost));

    expect(container.querySelector('.delete-post-btn')).not.toBeInTheDocument();
  });
});
