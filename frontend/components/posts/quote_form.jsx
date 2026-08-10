import React, { useState } from 'react';
import Modal from 'react-modal';

import { postTypeLabels, postTypes } from '../../config/post_types';
import { useCreatePost } from '../../query/post_hooks';
import { FormErrors, ModalButtonFooter } from './post_form_controls';
import { usePostFormProps } from './post_form_hooks';
import TagInput from './tag_input';
import useTagInput from './use_tag_input';

const QuoteForm = () => {
  const createPostMutation = useCreatePost();
  const {
    clearErrors,
    createPost,
    currentUser,
    errors,
    isSubmitting
  } = usePostFormProps(createPostMutation);
  const tagInput = useTagInput();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTitle('');
    setBody('');
    setUrl('');
    tagInput.reset();
    clearErrors();
  };

  const handleSubmit = e => {
    e.preventDefault();
    const tags = tagInput.commitDraft();
    if (!tags) return;

    const post = {
      title: `"${title}"`,
      body: `- ${body}`,
      url,
      post_type: postTypes.quote,
      tags
    };

    createPost(post).then(result => {
      if (result) closeModal();
    });
  };

  return (
    <div className="post-bar-content">
      <button className="post-bar-button" onClick={ openModal }>
        <div className="bar-button">
          <div className="button-icon">
            <i className="fa fa-quote-left fa-3x" aria-hidden="true"></i>
          </div>
          <span className="new-post-label">
            {postTypeLabels[postTypes.quote]}
          </span>
        </div>
      </button>

      <Modal isOpen={ showModal }
             contentLabel="Quote post form"
             className="post-form-modal"
             overlayClassName="post-form-modal-overlay"
             shouldCloseOnOverlayClick={ false }
             onRequestClose={ closeModal } >
             <div className="new-post-form">
               <span className="post-author">
                 { currentUser.username }
               </span>
               <div className="quote-post-form">
                 <div className="title-field">
                   <textarea className="title-input"
                             aria-label="Quote text"
                             placeholder="&quot;Quote&quot;"
                             value={ title }
                             onChange={ e => setTitle(e.currentTarget.value) } />

                 </div>
                 <div className="post-body">
                   <textarea className="body-input"
                     aria-label="Quote source"
                     placeholder="- Source"
                     value={ body }
                     onChange={ e => setBody(e.currentTarget.value) } />
                 </div>
                 <TagInput
                   disabled={isSubmitting}
                   {...tagInput.inputProps}
                 />
                 <div className="submit-form">
                   <FormErrors errors={ errors } />
                   <ModalButtonFooter
                     disabled={ !title || tagInput.hasError || isSubmitting }
                     onClose={ closeModal }
                     onSubmit={ handleSubmit }
                   />
                 </div>
               </div>
             </div>
      </Modal>
    </div>
  );
};

export default QuoteForm;
