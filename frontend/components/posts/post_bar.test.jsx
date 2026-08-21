import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useCurrentUser } from '../../query/session_hooks';
import PostBar from './post_bar';

vi.mock('../../query/session_hooks', () => ({
  useCurrentUser: vi.fn()
}));

vi.mock('./audio_form', () => ({ default: () => <button>Audio</button> }));
vi.mock('./link_form', () => ({ default: () => <button>Link</button> }));
vi.mock('./photo_form', () => ({ default: () => <button>Photo</button> }));
vi.mock('./quote_form', () => ({ default: () => <button>Quote</button> }));
vi.mock('./text_form', () => ({ default: () => <button>Text</button> }));
vi.mock('./video_form', () => ({ default: () => <button>Video</button> }));

describe('PostBar', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("links the current user's avatar to their profile", () => {
    useCurrentUser.mockReturnValue({
      data: {
        id: 1,
        avatar_url: '/avatars/athos.png',
        username: 'Athos'
      }
    });

    render(
      <MemoryRouter>
        <PostBar />
      </MemoryRouter>
    );

    const profileLink = screen.getByRole('link', {
      name: "View Athos's profile"
    });

    expect(profileLink).toHaveAttribute('href', '/users/1');
    expect(profileLink.querySelector('img')).toHaveAttribute(
      'src',
      '/avatars/athos.png'
    );
  });
});
