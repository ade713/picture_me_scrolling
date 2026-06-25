import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
      post_type: 'text'
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
      post_type: 'link'
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
      post_type: 'quote'
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

      await user.click(screen.getByRole('button', { name: 'Post' }));

      expect(createPostMutation.mutateAsync).toHaveBeenCalledWith(expectedPayload);
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

  it('shows a validation error for invalid link URLs', async () => {
    const user = userEvent.setup();
    render(<LinkForm />);

    await user.click(screen.getByRole('button', { name: 'Link' }));
    await user.type(screen.getByPlaceholderText('Name/describe link here'), 'Project notes');
    await user.type(screen.getByPlaceholderText('Type or paste Link URL here'), 'example.com/notes');
    await user.click(screen.getByRole('button', { name: 'Post' }));

    expect(screen.getByText(INVALID_LINK_URL_ERROR)).toBeInTheDocument();
    expect(createPostMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('trims valid link URLs before submit', async () => {
    const user = userEvent.setup();
    render(<LinkForm />);

    await user.click(screen.getByRole('button', { name: 'Link' }));
    await user.type(screen.getByPlaceholderText('Name/describe link here'), 'Project notes');
    await user.type(screen.getByPlaceholderText('Type or paste Link URL here'), ' https://example.com/notes ');
    await user.click(screen.getByRole('button', { name: 'Post' }));

    expect(createPostMutation.mutateAsync).toHaveBeenCalledWith({
      title: 'Project notes',
      body: '',
      url: 'https://example.com/notes',
      post_type: 'link'
    });
  });
});
