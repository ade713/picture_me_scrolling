import { screen, waitFor } from '@testing-library/react';
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
const followUserButtonName = `Follow ${basePost.author}`;
const likePostButtonName = `Like ${basePost.title}`;
const unfollowUserButtonName = `Unfollow ${basePost.author}`;
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

    const followButton = screen.getByRole('button', { name: followUserButtonName });

    expect(followButton).toHaveAttribute('title', followUserButtonName);

    await user.click(followButton);

    expect(followUser.mutate).toHaveBeenCalledWith(basePost.author_id);

    rerender(feedItemElement({ followed: true }));

    const unfollowButton = screen.getByRole('button', { name: unfollowUserButtonName });

    expect(unfollowButton).toHaveAttribute('title', unfollowUserButtonName);

    await user.click(unfollowButton);

    expect(unfollowUser.mutate).toHaveBeenCalledWith(basePost.author_id);
  });

  it('calls like and unlike mutations with the post id', async () => {
    const user = userEvent.setup();
    const { rerender } = renderFeedItem({ liked: false });

    const likeButton = screen.getByRole('button', { name: likePostButtonName });

    expect(likeButton).toHaveAttribute('title', likePostButtonName);

    await user.click(likeButton);

    expect(likePost.mutate).toHaveBeenCalledWith(basePost.id);

    rerender(feedItemElement({ liked: true }));

    const unlikeButton = screen.getByRole('button', { name: unlikePostButtonName });

    expect(unlikeButton).toHaveAttribute('title', unlikePostButtonName);

    await user.click(unlikeButton);

    expect(unlikePost.mutate).toHaveBeenCalledWith(basePost.id);
  });

  it('shows delete controls only for the current user posts', () => {
    const authoredPost = {
      ...basePost,
      author_id: currentUser.id
    };
    const { rerender } = renderFeedItem(authoredPost);

    expect(screen.queryByRole('button', { name: followUserButtonName })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: likePostButtonName })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: editPostButtonName })).toHaveAttribute('title', editPostButtonName);
    expect(screen.getByRole('button', { name: deletePostButtonName })).toHaveAttribute('title', deletePostButtonName);

    rerender(feedItemElement(basePost));

    expect(screen.queryByRole('button', { name: deletePostButtonName })).not.toBeInTheDocument();
  });

  it('requires confirmation before deleting current user posts', async () => {
    const user = userEvent.setup();
    const authoredPost = {
      ...basePost,
      author_id: currentUser.id
    };

    renderFeedItem(authoredPost);

    await user.click(screen.getByRole('button', { name: deletePostButtonName }));

    expect(screen.getByRole('dialog', { name: 'Delete post?' })).toBeInTheDocument();
    expect(deletePost.mutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(deletePost.mutate).toHaveBeenCalledWith(authoredPost);
    expect(screen.queryByRole('dialog', { name: 'Delete post?' })).not.toBeInTheDocument();
  });

  it('cancels delete confirmation without deleting the post', async () => {
    const user = userEvent.setup();
    const authoredPost = {
      ...basePost,
      author_id: currentUser.id
    };

    renderFeedItem(authoredPost);

    const deleteButton = screen.getByRole('button', { name: deletePostButtonName });

    await user.click(deleteButton);

    const cancelButton = screen.getByRole('button', { name: 'No' });
    await waitFor(() => expect(cancelButton).toHaveFocus());

    await user.keyboard('{Escape}');

    expect(deletePost.mutate).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: 'Delete post?' })).not.toBeInTheDocument();
    expect(deleteButton).toHaveFocus();
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
    const tagInput = screen.getByRole('textbox', { name: 'Tags' });

    expect(screen.getByText('#photography')).toBeInTheDocument();
    expect(screen.getByText('#sunset')).toBeInTheDocument();

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated title');
    await user.clear(bodyInput);
    await user.type(bodyInput, 'Updated body');
    await user.click(screen.getByRole('button', { name: 'Remove photography tag' }));
    await user.type(tagInput, ' Travel ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updatePost.mutateAsync).toHaveBeenCalledWith({
      id: authoredPost.id,
      post: {
        title: 'Updated title',
        body: 'Updated body',
        url: authoredPost.url,
        post_type: 'text',
        tags: ['sunset', 'travel']
      }
    });
  });

  it('prevents duplicate edit saves while an update request is pending', async () => {
    const user = userEvent.setup();
    let resolveUpdatePost;
    updatePost.mutateAsync.mockReturnValue(new Promise(resolve => {
      resolveUpdatePost = resolve;
    }));
    const authoredPost = {
      ...basePost,
      author_id: currentUser.id
    };

    renderFeedItem(authoredPost);

    await user.click(screen.getByRole('button', { name: editPostButtonName }));

    const titleInput = screen.getByPlaceholderText('Title');

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated title');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);
    await user.click(saveButton);

    expect(updatePost.mutateAsync).toHaveBeenCalledTimes(1);
    expect(saveButton).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Tags' })).toBeDisabled();

    resolveUpdatePost({ ...authoredPost, title: 'Updated title' });
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
        post_type: 'photo',
        tags: authoredMediaPost.tags
      }
    });
  });

  it('preserves edited tags after an update request fails', async () => {
    const user = userEvent.setup();
    updatePost.mutateAsync.mockRejectedValue(new Error('Request failed'));
    const authoredPost = {
      ...basePost,
      author_id: currentUser.id
    };

    renderFeedItem(authoredPost);

    await user.click(screen.getByRole('button', { name: editPostButtonName }));
    await user.click(screen.getByRole('button', { name: 'Remove photography tag' }));
    await user.type(screen.getByRole('textbox', { name: 'Tags' }), 'travel{Enter}');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('dialog', { name: editPostButtonName })).toBeInTheDocument();
    expect(screen.queryByText('#photography')).not.toBeInTheDocument();
    expect(screen.getByText('#sunset')).toBeInTheDocument();
    expect(screen.getByText('#travel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
  });
});
