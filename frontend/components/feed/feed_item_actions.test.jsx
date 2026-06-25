import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useDeletePost, useLikePost, useUnlikePost, useUpdatePost } from '../../query/post_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import { basePost,
         createFeedItemMutations,
         feedItemElement,
         renderFeedItem } from '../../test/feed_item_helpers';
import { currentUser } from '../../test/fixtures';
import { setupModalAppElement } from '../../test/modal_helpers';
import { useFollowUser, useUnfollowUser } from '../../query/user_hooks';

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

vi.mock('../../query/post_hooks', () => ({
  useDeletePost: vi.fn(),
  useLikePost: vi.fn(),
  useUnlikePost: vi.fn(),
  useUpdatePost: vi.fn()
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
  let cleanupModalAppElement;
  let unfollowUser;
  let unlikePost;
  let updatePost;

  beforeEach(() => {
    cleanupModalAppElement = setupModalAppElement();
    ({ deletePost, followUser, likePost, unfollowUser, unlikePost, updatePost } = createFeedItemMutations());

    useCurrentUser.mockReturnValue({ data: currentUser });
    useDeletePost.mockReturnValue(deletePost);
    useFollowUser.mockReturnValue(followUser);
    useLikePost.mockReturnValue(likePost);
    useUnfollowUser.mockReturnValue(unfollowUser);
    useUnlikePost.mockReturnValue(unlikePost);
    useUpdatePost.mockReturnValue(updatePost);
  });

  afterEach(() => {
    cleanupModalAppElement();
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

  it('opens the edit modal and submits updated text post fields', async () => {
    const user = userEvent.setup();
    const authoredPost = {
      ...basePost,
      author_id: currentUser.id
    };

    renderFeedItem(authoredPost);

    await user.click(screen.getByRole('button', { name: editPostButtonName }));

    expect(screen.getByRole('dialog', { name: editPostButtonName })).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText('Title');
    const bodyInput = screen.getByPlaceholderText('Your text here');

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated title');
    await user.clear(bodyInput);
    await user.type(bodyInput, 'Updated body');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updatePost.mutateAsync).toHaveBeenCalledWith({
      id: authoredPost.id,
      post: {
        title: 'Updated title',
        body: 'Updated body',
        url: authoredPost.url,
        post_type: 'text'
      }
    });
  });

  it('opens the edit modal and submits updated media post captions', async () => {
    const user = userEvent.setup();
    const authoredMediaPost = {
      ...basePost,
      author_id: currentUser.id,
      post_type: 'photo'
    };

    renderFeedItem(authoredMediaPost);

    await user.click(screen.getByRole('button', { name: editPostButtonName }));

    expect(screen.getByRole('dialog', { name: editPostButtonName })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: deletePostButtonName })).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText('Title');

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated photo caption');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updatePost.mutateAsync).toHaveBeenCalledWith({
      id: authoredMediaPost.id,
      post: {
        title: 'Updated photo caption',
        body: authoredMediaPost.body,
        url: authoredMediaPost.url,
        post_type: 'photo'
      }
    });
  });
});
