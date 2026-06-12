import React, { useState } from 'react';
import Modal from 'react-modal';

import { useCreatePost } from '../../query/post_hooks';
import formStyles from './modal_style';
import { FormErrors, ModalButtonFooter } from './post_form_controls';
import { usePostFormProps } from './post_form_hooks';

const QuoteForm = () => {
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
      title: `"${title}"`,
      body: `- ${body}`,
      url,
      post_type: 'quote'
    };

    createPost(post).then(closeModal);
  };

  return (
    <div className="post-bar-content">
      <button className="post-bar-button" onClick={ openModal }>
        <div className="bar-button">
          <div className="button-icon">
            <i className="fa fa-quote-left fa-3x" aria-hidden="true"></i>
          </div>
          <span className="new-post-label">
            Quote
          </span>
        </div>
      </button>

      <Modal isOpen={ showModal }
             contentLabel="Quote post form"
             style={ formStyles }
             shouldCloseOnOverlayClick={ false }
             onRequestClose={ closeModal } >
             <div className="new-post-form">
               <span className="post-author">
                 { currentUser.username }
               </span>
               <div className="quote-post-form">
                 <div className="title-field">
                   <textarea className="title-input"
                             type="text"
                             placeholder="&quot;Quote&quot;"
                             value={ title }
                             onChange={ e => setTitle(e.currentTarget.value) } />

                 </div>
                 <div className="post-body">
                   <textarea className="body-input"
                     type="text"
                     placeholder="- Source"
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

export default QuoteForm;
