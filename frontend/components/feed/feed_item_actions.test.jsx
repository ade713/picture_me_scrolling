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

const editPostButtonName = `Edit ${basePost.title}`;
const deletePostButtonName = `Delete ${basePost.title}`;
const likePostButtonName = `Like ${basePost.title}`;
const unlikePostButtonName = `Unlike ${basePost.title}`;

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
    const { rerender } = renderFeedItem({ liked: false });

    await user.click(screen.getByRole('button', { name: likePostButtonName }));

    expect(likePost.mutate).toHaveBeenCalledWith(basePost.id);

    rerender(feedItemElement({ liked: true }));

    await user.click(screen.getByRole('button', { name: unlikePostButtonName }));

    expect(unlikePost.mutate).toHaveBeenCalledWith(basePost.id);
  });

  it('shows delete controls only for the current user posts', async () => {
    const user = userEvent.setup();
    const authoredPost = {
      ...basePost,
      author_id: currentUser.id
    };
    const { rerender } = renderFeedItem(authoredPost);

    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: likePostButtonName })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: editPostButtonName })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: deletePostButtonName })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: deletePostButtonName }));

    expect(deletePost.mutate).toHaveBeenCalledWith(authoredPost);

    rerender(feedItemElement(basePost));

    expect(screen.queryByRole('button', { name: deletePostButtonName })).not.toBeInTheDocument();
  });
});
