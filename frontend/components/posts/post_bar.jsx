import React from 'react';

import { useCurrentUser } from '../../query/session_hooks';
import AudioForm from './audio_form';
import LinkForm from './link_form';
import PhotoForm from './photo_form';
import QuoteForm from './quote_form';
import TextForm from './text_form';
import VideoForm from './video_form';

const PostBar = () => {
  const currentUser = useCurrentUser();

  return (
    <div className="post-bar">
      <img
        alt={ `${currentUser.data.username} avatar` }
        className="user-avatar"
        src={ currentUser.data.avatar_url } />
      <div className="post-form-links">
        <div className="bar-form-button">
          <TextForm />
        </div>
        <div className="bar-form-button">
          <QuoteForm />
        </div>
        <div className="bar-form-button">
          <PhotoForm />
        </div>
        <div className="bar-form-button">
          <LinkForm />
        </div>
        <div className="bar-form-button">
          <AudioForm />
        </div>
        <div className="bar-form-button">
          <VideoForm />
        </div>
      </div>
    </div>
  );
};

export default PostBar;
