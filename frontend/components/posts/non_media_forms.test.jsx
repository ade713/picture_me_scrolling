import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TAG_FORMAT_ERROR } from '../../config/tags';
import { useCreatePost } from '../../query/post_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import { currentUser } from '../../test/fixtures';
import { setupModalAppElement } from '../../test/modal_helpers';
import { INVALID_LINK_URL_ERROR } from '../../util/link_url_validation';
import LinkForm from './link_form';
import QuoteForm from './quote_form';
import TextForm from './text_form';

vi.mock('../../query/post_hooks', () => ({
  useCreatePost: vi.fn()
}));

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

const nonMediaFormCases = [
  {
    buttonName: 'Text',
    Component: TextForm,
    fields: [
      {
        placeholder: 'Title',
        value: 'A small thought'
      },
      {
        placeholder: 'Your text here',
        value: 'This is the post body.'
      }
    ],
    expectedPayload: {
      title: 'A small thought',
      body: 'This is the post body.',
      url: '',
      post_type: 'text',
      tags: ['photography']
    }
  },
  {
    buttonName: 'Link',
    Component: LinkForm,
    fields: [
      {
        placeholder: 'Name/describe link here',
        value: 'Project notes'
      },
      {
        placeholder: 'Type or paste Link URL here',
        value: 'https://example.com/notes'
      }
    ],
    expectedPayload: {
      title: 'Project notes',
      body: '',
      url: 'https://example.com/notes',
      post_type: 'link',
      tags: ['photography']
    }
  },
  {
    buttonName: 'Quote',
    Component: QuoteForm,
    fields: [
      {
        placeholder: '"Quote"',
        value: 'One for all'
      },
      {
        placeholder: '- Source',
        value: 'The Musketeers'
      }
    ],
    expectedPayload: {
      title: '"One for all"',
      body: '- The Musketeers',
      url: '',
      post_type: 'quote',
      tags: ['photography']
    }
  }
];

describe('non-media post forms', () => {
  let cleanupModalAppElement;
  let createPostMutation;

  beforeEach(() => {
    cleanupModalAppElement = setupModalAppElement();

    createPostMutation = {
      error: null,
      mutateAsync: vi.fn().mockResolvedValue({ id: 1 }),
      reset: vi.fn()
    };

    useCurrentUser.mockReturnValue({ data: currentUser });
    useCreatePost.mockReturnValue(createPostMutation);
  });

  afterEach(() => {
    cleanupModalAppElement();
    vi.clearAllMocks();
  });

  nonMediaFormCases.forEach(({ buttonName, Component, fields, expectedPayload }) => {
    it(`submits a ${buttonName.toLowerCase()} post payload`, async () => {
      const user = userEvent.setup();
      render(<Component />);

      await user.click(screen.getByRole('button', { name: buttonName }));

      expect(screen.getByText('PicMeS Guest')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();

      for (const { placeholder, value } of fields) {
        await user.type(screen.getByPlaceholderText(placeholder), value);
      }

      await user.type(screen.getByRole('textbox', { name: 'Tags' }), ' Photography ');
      await user.click(screen.getByRole('button', { name: 'Post' }));

      expect(createPostMutation.mutateAsync).toHaveBeenCalledWith(expectedPayload);

      await waitFor(() => (
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      ));
      await user.click(screen.getByRole('button', { name: buttonName }));

      expect(screen.getByRole('textbox', { name: 'Tags' })).toHaveValue('');
      expect(screen.queryByText('#photography')).not.toBeInTheDocument();
    });
  });

  it('prevents duplicate post submissions while a create request is pending', async () => {
    const user = userEvent.setup();
    let resolveCreatePost;
    createPostMutation.mutateAsync.mockReturnValue(new Promise(resolve => {
      resolveCreatePost = resolve;
    }));

    render(<TextForm />);

    await user.click(screen.getByRole('button', { name: 'Text' }));
    await user.type(screen.getByPlaceholderText('Title'), 'A small thought');

    const postButton = screen.getByRole('button', { name: 'Post' });
    await user.click(postButton);
    await user.click(postButton);

    expect(createPostMutation.mutateAsync).toHaveBeenCalledTimes(1);
    expect(postButton).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Tags' })).toBeDisabled();

    resolveCreatePost({ id: 1 });
  });

  it('clears text and tag state and errors when closed', async () => {
    const user = userEvent.setup();
    createPostMutation.error = {
      errors: ['Title cannot be blank']
    };

    render(<TextForm />);

    await user.click(screen.getByRole('button', { name: 'Text' }));
    await user.type(screen.getByPlaceholderText('Title'), 'Draft title');
    await user.type(screen.getByRole('textbox', { name: 'Tags' }), 'photography{Enter}');

    expect(screen.getByDisplayValue('Draft title')).toBeInTheDocument();
    expect(screen.getByText('#photography')).toBeInTheDocument();
    expect(screen.getByText('Title cannot be blank')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(createPostMutation.reset).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Text' }));

    expect(screen.getByPlaceholderText('Title')).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Tags' })).toHaveValue('');
    expect(screen.queryByText('#photography')).not.toBeInTheDocument();
  });

  it('preserves tags when post creation does not succeed', async () => {
    const user = userEvent.setup();
    createPostMutation.mutateAsync.mockRejectedValue(new Error('Request failed'));

    render(<TextForm />);

    await user.click(screen.getByRole('button', { name: 'Text' }));
    await user.type(screen.getByPlaceholderText('Title'), 'Draft title');
    await user.type(screen.getByRole('textbox', { name: 'Tags' }), 'photography{Enter}');
    await user.click(screen.getByRole('button', { name: 'Post' }));

    expect(screen.getByRole('dialog', { name: 'Text post form' })).toBeInTheDocument();
    expect(screen.getByText('#photography')).toBeInTheDocument();
  });

  it('blocks submission while the tag draft is invalid', async () => {
    const user = userEvent.setup();
    render(<TextForm />);

    await user.click(screen.getByRole('button', { name: 'Text' }));
    await user.type(screen.getByPlaceholderText('Title'), 'Draft title');
    await user.type(screen.getByRole('textbox', { name: 'Tags' }), 'invalid-tag');

    expect(screen.getByText(TAG_FORMAT_ERROR)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
    expect(createPostMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('closes a post modal with Escape and returns focus to its trigger', async () => {
    const user = userEvent.setup();

    render(<TextForm />);

    const trigger = screen.getByRole('button', { name: 'Text' });
    await user.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Text post form' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Text post form' })).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('shows a validation error for invalid link URLs', async () => {
    const user = userEvent.setup();
    render(<LinkForm />);

    await user.click(screen.getByRole('button', { name: 'Link' }));
    await user.type(screen.getByPlaceholderText('Name/describe link here'), 'Project notes');
    await user.type(
      screen.getByPlaceholderText('Type or paste Link URL here'),
      'example.com/notes'
    );
    await user.click(screen.getByRole('button', { name: 'Post' }));

    expect(screen.getByText(INVALID_LINK_URL_ERROR)).toBeInTheDocument();
    expect(createPostMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('trims valid link URLs before submit', async () => {
    const user = userEvent.setup();
    render(<LinkForm />);

    await user.click(screen.getByRole('button', { name: 'Link' }));
    await user.type(screen.getByPlaceholderText('Name/describe link here'), 'Project notes');
    await user.type(
      screen.getByPlaceholderText('Type or paste Link URL here'),
      ' https://example.com/notes '
    );
    await user.click(screen.getByRole('button', { name: 'Post' }));

    expect(createPostMutation.mutateAsync).toHaveBeenCalledWith({
      title: 'Project notes',
      body: '',
      url: 'https://example.com/notes',
      post_type: 'link',
      tags: []
    });
  });
});
