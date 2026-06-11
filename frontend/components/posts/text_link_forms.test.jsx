import React from 'react';
import Modal from 'react-modal';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useCreatePost } from '../../query/post_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import LinkForm from './link_form';
import TextForm from './text_form';

vi.mock('../../query/post_hooks', () => ({
  useCreatePost: vi.fn()
}));

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

const currentUser = {
  id: 1,
  username: 'PicMeS Guest'
};

describe('text and link post forms', () => {
  let appElement;
  let createPostMutation;

  beforeEach(() => {
    appElement = document.createElement('div');
    appElement.id = 'react-modal-app-root';
    document.body.appendChild(appElement);
    Modal.setAppElement(appElement);

    createPostMutation = {
      error: null,
      mutateAsync: vi.fn().mockResolvedValue({ id: 1 }),
      reset: vi.fn()
    };

    useCurrentUser.mockReturnValue({ data: currentUser });
    useCreatePost.mockReturnValue(createPostMutation);
  });

  afterEach(() => {
    if (appElement) {
      appElement.remove();
    }
    vi.clearAllMocks();
  });

  it('submits a text post payload and closes the modal', async () => {
    const user = userEvent.setup();
    render(<TextForm />);

    await user.click(screen.getByRole('button', { name: 'Text' }));

    expect(screen.getByText('PicMeS Guest')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Title'), 'A small thought');
    await user.type(screen.getByPlaceholderText('Your text here'), 'This is the post body.');
    await user.click(screen.getByRole('button', { name: 'Post' }));

    expect(createPostMutation.mutateAsync).toHaveBeenCalledWith({
      title: 'A small thought',
      body: 'This is the post body.',
      url: '',
      post_type: 'text'
    });

    await waitFor(() => {
      expect(screen.queryByText('PicMeS Guest')).not.toBeInTheDocument();
    });
  });

  it('clears text form state and errors when closed', async () => {
    const user = userEvent.setup();
    createPostMutation.error = {
      errors: ['Title cannot be blank']
    };

    render(<TextForm />);

    await user.click(screen.getByRole('button', { name: 'Text' }));
    await user.type(screen.getByPlaceholderText('Title'), 'Draft title');

    expect(screen.getByDisplayValue('Draft title')).toBeInTheDocument();
    expect(screen.getByText('Title cannot be blank')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(createPostMutation.reset).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Text' }));

    expect(screen.getByPlaceholderText('Title')).toHaveValue('');
  });

  it('submits a link post payload', async () => {
    const user = userEvent.setup();
    render(<LinkForm />);

    await user.click(screen.getByRole('button', { name: 'Link' }));

    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Name/describe link here'), 'Project notes');
    await user.type(screen.getByPlaceholderText('Type or paste Link URL here'), 'https://example.com/notes');
    await user.click(screen.getByRole('button', { name: 'Post' }));

    expect(createPostMutation.mutateAsync).toHaveBeenCalledWith({
      title: 'Project notes',
      body: '',
      url: 'https://example.com/notes',
      post_type: 'link'
    });
  });
});
