import React, { useRef, useState } from 'react';
import Modal from 'react-modal';

import { mediaPostTypes, postTypes } from '../../config/post_types';
import { useUpdatePost } from '../../query/post_hooks';
import { INVALID_LINK_URL_ERROR, validateLinkUrl } from '../../util/link_url_validation';
import { FormErrors, ModalButtonFooter } from './post_form_controls';

const quoteText = title => (title || '').replace(/^"|"$/g, '');
const quoteSource = body => (body || '').replace(/^-\s?/, '');
const isLinkPost = post => post.post_type === postTypes.link;
const isMediaPost = post => mediaPostTypes.includes(post.post_type);
const isQuotePost = post => post.post_type === postTypes.quote;

const initialFields = post => {
  if (isQuotePost(post)) {
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
  if (isQuotePost(post)) {
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
const titlePlaceholder = post => (
  isLinkPost(post) ? 'Name/describe link here' : 'Title'
);
const bodyPlaceholder = post => (
  isQuotePost(post) ? '- Source' : 'Your text here'
);
const disableSubmit = ({ post, title, url }) => (
  isLinkPost(post) ? !url : !title
);

const EditPostForm = ({ isOpen, onClose, post }) => {
  const updatePost = useUpdatePost();
  const submittingRef = useRef(false);
  const fields = initialFields(post);
  const [body, setBody] = useState(fields.body);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(fields.title);
  const [url, setUrl] = useState(fields.url);
  const [linkErrors, setLinkErrors] = useState([]);
  const mutationIsSubmitting = updatePost.isPending || updatePost.isLoading;
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
    if (submittingRef.current || mutationIsSubmitting) return;

    const normalizedUrl = url.trim();

    if (isLinkPost(post) && !validateLinkUrl(normalizedUrl)) {
      setLinkErrors([INVALID_LINK_URL_ERROR]);
      return;
    }

    setLinkErrors([]);
    submittingRef.current = true;
    setIsSubmitting(true);

    updatePost.mutateAsync({
      id: post.id,
      post: buildPostPayload({
        body,
        post,
        title,
        url: normalizedUrl
      })
    }).then(closeModal).finally(() => {
      submittingRef.current = false;
      setIsSubmitting(false);
    });
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
            aria-label={ isLinkPost(post) ? 'Edit link title' : 'Edit post title' }
            placeholder={ titlePlaceholder(post) }
            value={ title }
            onChange={ e => setTitle(e.currentTarget.value) } />
        </div>
        { isLinkPost(post) && (
          <div className="post-body">
            <textarea
              className="body-input"
              aria-label="Edit link URL"
              placeholder="Type or paste Link URL here"
              value={ url }
              onChange={ e => {
                setUrl(e.currentTarget.value);
                setLinkErrors([]);
              } } />
          </div>
        ) }
        { !isLinkPost(post) && !isMediaPost(post) && (
          <div className="post-body">
            <textarea
              className="body-input"
              aria-label={ isQuotePost(post) ? 'Edit quote source' : 'Edit post body' }
              placeholder={ bodyPlaceholder(post) }
              value={ body }
              onChange={ e => setBody(e.currentTarget.value) } />
          </div>
        ) }
        <div className="submit-form">
          <FormErrors errors={ [...linkErrors, ...mutationErrors] } />
          <ModalButtonFooter
            disabled={
              disableSubmit({ post, title, url }) ||
              isSubmitting ||
              mutationIsSubmitting
            }
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
