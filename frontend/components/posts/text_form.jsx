import React, { useState } from 'react';
import Modal from 'react-modal';

import { postTypeLabels, postTypes } from '../../config/post_types';
import { useCreatePost } from '../../query/post_hooks';
import { FormErrors, ModalButtonFooter } from './post_form_controls';
import { usePostFormProps } from './post_form_hooks';

const TextForm = () => {
  const createPostMutation = useCreatePost();
  const { clearErrors, createPost, currentUser, errors, isSubmitting } = usePostFormProps(createPostMutation);
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
    clearErrors();
  };

  const handleSubmit = e => {
    e.preventDefault();
    const post = {
      title,
      body,
      url,
      post_type: postTypes.text
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
            <i className="fa fa-font fa-3x" aria-hidden="true"></i>
          </div>
          <span className="new-post-label">
            {postTypeLabels[postTypes.text]}
          </span>
        </div>
      </button>

      <Modal isOpen={ showModal }
             contentLabel="Text post form"
             className="post-form-modal"
             overlayClassName="post-form-modal-overlay"
             shouldCloseOnOverlayClick={ false }
             onRequestClose={ closeModal } >
             <div className="new-post-form">
               <span className="post-author">
                 { currentUser.username }
               </span>
               <div className="text-post-form">
                 <div className="title-field">
                   <textarea
                     className="title-input"
                     aria-label="Text post title"
                     placeholder="Title"
                     value={ title }
                     onChange={ e => setTitle(e.currentTarget.value) } />

                 </div>
                 <div className="post-body">
                   <textarea
                     className="body-input"
                     aria-label="Text post body"
                     placeholder="Your text here"
                     value={ body }
                     onChange={ e => setBody(e.currentTarget.value) } />
                 </div>
                 <div className="submit-form">
                   <FormErrors errors={ errors } />
                   <ModalButtonFooter
                     disabled={ !title || isSubmitting }
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

export default TextForm;
