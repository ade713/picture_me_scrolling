import React from 'react';

import { imageLoadingProps } from '../../util/media_loading_util';

export const AudioPost = ({ footer, header, post }) => (
  <div className="post-audio">
    { header }
    <div className="post-upload-audio">
      <audio controls preload="metadata">
        <source src={ post.image_url } />
      </audio>
    </div>
    <div className="post-caption">
      { post.title }
    </div>
    { footer }
  </div>
);

export const LinkPost = ({ footer, header, post }) => (
  <div className="post-link">
    { header }
    <div className="post-link-main">
      <a
        className="posted-link"
        href={ post.url }
        target="_blank"
        rel="noopener noreferrer">
        { post.title }
      </a>
    </div>
    { footer }
  </div>
);

export const PhotoPost = ({ footer, header, post, priorityMedia = false }) => (
  <div className="post-photo">
    { header }
    <div className="post-upload-photo">
      <img
        alt={ post.title || 'Uploaded post' }
        { ...imageLoadingProps(priorityMedia) }
        src={ post.image_url } />
    </div>
    <div className="post-caption">
      { post.title }
    </div>
    { footer }
  </div>
);

export const QuotePost = ({ footer, header, post }) => (
  <div className="post-quote">
    { header }
    <div className="post-content">
      <div className="quote">
        { post.title }
      </div>
      <div className="source">
        { post.body }
      </div>
    </div>
    { footer }
  </div>
);

export const TextPost = ({ footer, header, post }) => (
  <div className="post-text">
    { header }
    <div className="post-content">
      <div className="post-title">
        { post.title }
      </div>
      <div className="post-body">
        { post.body }
      </div>
    </div>
    { footer }
  </div>
);

export const VideoPost = ({ footer, header, post }) => (
  <div className="post-video">
    { header }
    <div className="post-upload-video">
      <video controls preload="metadata">
        <source src={ post.image_url } />
      </video>
    </div>
    <div className="post-caption">
      { post.title }
    </div>
    { footer }
  </div>
);
