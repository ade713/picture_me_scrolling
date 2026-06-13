import React, { useState } from 'react';
import Modal from 'react-modal';

import { useCreatePost } from '../../query/post_hooks';
import { FormErrors, ModalButtonFooter } from './post_form_controls';
import { usePostFormProps } from './post_form_hooks';

const LinkForm = () => {
  const createPostMutation = useCreatePost();
  const { clearErrors, createPost, currentUser, errors } = usePostFormProps(createPostMutation);
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
      post_type: 'link'
    };

    createPost(post).then(closeModal);
  };

  return (
    <div className="post-bar-content">
      <button className="post-bar-button" onClick={ openModal }>
        <div className="bar-button">
          <div className="button-icon">
            <i className="fa fa-link fa-3x" aria-hidden="true"></i>
          </div>
          <span className="new-post-label">
            Link
          </span>
        </div>
      </button>

      <Modal isOpen={ showModal }
             contentLabel="Link post form"
             className="post-form-modal"
             overlayClassName="post-form-modal-overlay"
             shouldCloseOnOverlayClick={ false }
             onRequestClose={ closeModal } >
             <div className="link-post-form">
               <span className="post-author">
                 { currentUser.username }
               </span>
               <div className="post-form">
                 <div className="title-field">
                   <textarea className="title-input"
                     placeholder="Name/describe link here"
                     value={ title }
                     onChange={ e => setTitle(e.currentTarget.value) } />

                 </div>

                 <div className="post-body">
                   <textarea
                     className="body-input"
                     placeholder="Type or paste Link URL here"
                     value={ url }
                     onChange={ e => setUrl(e.currentTarget.value) } />
                 </div>

                 <div className="submit-form">
                   <FormErrors errors={ errors } />
                   <ModalButtonFooter
                     disabled={ !url }
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

export default LinkForm;
