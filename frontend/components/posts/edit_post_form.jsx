import React, { useState } from 'react';
import Modal from 'react-modal';

import { useUpdatePost } from '../../query/post_hooks';
import { INVALID_LINK_URL_ERROR, validateLinkUrl } from '../../util/link_url_validation';
import { FormErrors, ModalButtonFooter } from './post_form_controls';

export const EDITABLE_POST_TYPES = ['link', 'quote', 'text'];

const quoteText = title => (title || '').replace(/^"|"$/g, '');
const quoteSource = body => (body || '').replace(/^-\s?/, '');

const initialFields = post => {
  if (post.post_type === 'quote') {
    return {
      body: quoteSource(post.body),
      title: quoteText(post.title),
      url: post.url || ''
    };
  }

  return {
    body: post.body || '',
    title: post.title || '',
    url: post.url || ''
  };
};

const buildPostPayload = ({ body, post, title, url }) => {
  if (post.post_type === 'quote') {
    return {
      title: `"${title}"`,
      body: `- ${body}`,
      url,
      post_type: post.post_type
    };
  }

  return {
    title,
    body,
    url,
    post_type: post.post_type
  };
};

const editContentLabel = post => `Edit ${post.title || 'post'}`;

const EditPostForm = ({ isOpen, onClose, post }) => {
  const updatePost = useUpdatePost();
  const fields = initialFields(post);
  const [body, setBody] = useState(fields.body);
  const [title, setTitle] = useState(fields.title);
  const [url, setUrl] = useState(fields.url);
  const [linkErrors, setLinkErrors] = useState([]);
  const mutationErrors = updatePost.error
    ? updatePost.error.errors || [updatePost.error.message]
    : [];

  const closeModal = () => {
    updatePost.reset();
    setLinkErrors([]);
    onClose();
  };

  const handleSubmit = e => {
    e.preventDefault();
    const normalizedUrl = url.trim();

    if (post.post_type === 'link' && !validateLinkUrl(normalizedUrl)) {
      setLinkErrors([INVALID_LINK_URL_ERROR]);
      return;
    }

    setLinkErrors([]);

    updatePost.mutateAsync({
      id: post.id,
      post: buildPostPayload({
        body,
        post,
        title,
        url: normalizedUrl
      })
    }).then(closeModal);
  };

  return (
    <Modal
      isOpen={ isOpen }
      contentLabel={ editContentLabel(post) }
      className="post-form-modal"
      overlayClassName="post-form-modal-overlay"
      shouldCloseOnOverlayClick={ false }
      onRequestClose={ closeModal }>
      <div className="post-form">
        <span className="post-author">
          Edit { post.author } post
        </span>
        <div className="title-field">
          <textarea
            className="title-input"
            placeholder={ post.post_type === 'link' ? 'Name/describe link here' : 'Title' }
            value={ title }
            onChange={ e => setTitle(e.currentTarget.value) } />
        </div>
        { post.post_type === 'link' ? (
          <div className="post-body">
            <textarea
              className="body-input"
              placeholder="Type or paste Link URL here"
              value={ url }
              onChange={ e => {
                setUrl(e.currentTarget.value);
                setLinkErrors([]);
              } } />
          </div>
        ) : (
          <div className="post-body">
            <textarea
              className="body-input"
              placeholder={ post.post_type === 'quote' ? '- Source' : 'Your text here' }
              value={ body }
              onChange={ e => setBody(e.currentTarget.value) } />
          </div>
        ) }
        <div className="submit-form">
          <FormErrors errors={ [...linkErrors, ...mutationErrors] } />
          <ModalButtonFooter
            disabled={ post.post_type === 'link' ? !url : !title }
            onClose={ closeModal }
            onSubmit={ handleSubmit }
            submitLabel="Save"
          />
        </div>
      </div>
    </Modal>
  );
};

export default EditPostForm;
