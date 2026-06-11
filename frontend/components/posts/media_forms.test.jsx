import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useCreateMediaPost } from '../../query/post_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import { setupModalAppElement } from '../../test/modal_helpers';
import AudioForm from './audio_form';
import PhotoForm from './photo_form';
import VideoForm from './video_form';

vi.mock('../../query/post_hooks', () => ({
  useCreateMediaPost: vi.fn()
}));

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

const currentUser = {
  id: 1,
  username: 'PicMeS Guest'
};

const mediaFormCases = [
  {
    buttonName: 'Photo',
    Component: PhotoForm,
    file: new File(['photo-content'], 'photo.png', { type: 'image/png' }),
    placeholder: /Upload Photo above/,
    postType: 'photo'
  },
  {
    buttonName: 'Audio',
    Component: AudioForm,
    file: new File(['audio-content'], 'audio.mp3', { type: 'audio/mpeg' }),
    placeholder: /Upload Audio\/Song above/,
    postType: 'audio'
  },
  {
    buttonName: 'Video',
    Component: VideoForm,
    file: new File(['video-content'], 'video.mp4', { type: 'video/mp4' }),
    placeholder: /Upload Video above/,
    postType: 'video'
  }
];

const getOpenModalFileInput = () => (
  screen.getByRole('dialog').querySelector('input[type="file"]')
);

describe('media post forms', () => {
  let cleanupModalAppElement;
  let createMediaPostMutation;
  let originalFileReader;

  beforeEach(() => {
    cleanupModalAppElement = setupModalAppElement();

    createMediaPostMutation = {
      error: null,
      mutateAsync: vi.fn().mockResolvedValue({ id: 1 }),
      reset: vi.fn()
    };

    originalFileReader = window.FileReader;
    window.FileReader = class {
      readAsDataURL() {
        this.result = 'data:media/mock;base64,preview';

        if (this.onloadend) {
          this.onloadend();
        }
      }
    };

    useCurrentUser.mockReturnValue({ data: currentUser });
    useCreateMediaPost.mockReturnValue(createMediaPostMutation);
  });

  afterEach(() => {
    window.FileReader = originalFileReader;
    cleanupModalAppElement();
    vi.clearAllMocks();
  });

  mediaFormCases.forEach(({ buttonName, Component, file, placeholder, postType }) => {
    it(`submits ${postType} uploads as FormData`, async () => {
      const user = userEvent.setup();
      render(<Component />);

      await user.click(screen.getByRole('button', { name: buttonName }));

      expect(screen.getByText('PicMeS Guest')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();

      await user.upload(getOpenModalFileInput(), file);
      await user.type(screen.getByPlaceholderText(placeholder), `${buttonName} caption`);
      await user.click(screen.getByRole('button', { name: 'Post' }));

      const submittedFormData = createMediaPostMutation.mutateAsync.mock.calls[0][0];

      expect(submittedFormData).toBeInstanceOf(FormData);
      expect(submittedFormData.get('post[url]')).toBe('');
      expect(submittedFormData.get('post[title]')).toBe(`${buttonName} caption`);
      expect(submittedFormData.get('post[post_type]')).toBe(postType);
      expect(submittedFormData.get('post[body]')).toBe('');
      expect(submittedFormData.get('post[image]')).toBe(file);
    });
  });

  it('clears media form state and errors when closed', async () => {
    const user = userEvent.setup();
    createMediaPostMutation.error = {
      errors: ['Image must be attached']
    };

    render(<PhotoForm />);

    await user.click(screen.getByRole('button', { name: 'Photo' }));
    await user.upload(getOpenModalFileInput(), mediaFormCases[0].file);
    await user.type(screen.getByPlaceholderText(/Upload Photo above/), 'Draft caption');

    expect(screen.getByDisplayValue('Draft caption')).toBeInTheDocument();
    expect(screen.getByText('Image must be attached')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post' })).not.toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(createMediaPostMutation.reset).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Photo' }));

    expect(screen.getByPlaceholderText(/Upload Photo above/)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
  });
});
