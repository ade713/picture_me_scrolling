import React, { useState } from 'react';
import Modal from 'react-modal';

import { useCreatePost } from '../../query/post_hooks';
import formStyles from './modal_style';
import { FormErrors, ModalButtonFooter } from './post_form_controls';
import { usePostFormProps } from './post_form_hooks';

const TextForm = () => {
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
      post_type: 'text'
    };

    createPost(post).then(closeModal);
  };

  return (
    <div className="post-bar-content">
      <button className="post-bar-button" onClick={ openModal }>
        <label className="bar-button">
          <div className="button-icon">
            <i className="fa fa-font fa-3x" aria-hidden="true"></i>
          </div>
          <span className="new-post-label">
            Text
          </span>
        </label>
      </button>

      <Modal isOpen={ showModal }
             contentLabel="Text post form"
             style={ formStyles }
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
                     type="text"
                     placeholder="Title"
                     value={ title }
                     onChange={ e => setTitle(e.currentTarget.value) } />

                 </div>
                 <div className="post-body">
                   <textarea
                     className="body-input"
                     type="text"
                     placeholder="Your text here"
                     value={ body }
                     onChange={ e => setBody(e.currentTarget.value) } />
                 </div>
                 <div className="submit-form">
                   <FormErrors errors={ errors } />
                   <ModalButtonFooter
                     disabled={ !title }
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
