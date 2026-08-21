import React from 'react';
import { Link } from 'react-router-dom';

import { routes } from '../../config/routes';
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
      <Link
        aria-label={`View ${currentUser.data.username}'s profile`}
        className="post-bar-avatar-link"
        to={routes.userProfile(currentUser.data.id)}>
        <img
          alt=""
          className="user-avatar"
          src={ currentUser.data.avatar_url } />
      </Link>
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
