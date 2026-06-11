import React from 'react';
import Modal from 'react-modal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useCreatePost } from '../../query/post_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import LinkForm from './link_form';
import QuoteForm from './quote_form';
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

});
