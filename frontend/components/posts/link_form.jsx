import React, { useState } from 'react';
import Modal from 'react-modal';

import formStyles from './modal_style';

const LinkForm = ({ clearErrors, createPost, currentUser, errors }) => {
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

  const renderErrors = () => (
    <ul>
      { errors.map((error, index) => (
        <li key={ `error-${index}` }>
          { error }
        </li>
      )) }
    </ul>
  );

  return (
    <div className="post-bar-content">
      <button className="post-bar-button" onClick={ openModal }>
        <label className="bar-button">
          <div className="button-icon">
            <i className="fa fa-link fa-3x" aria-hidden="true"></i>
          </div>
          <span className="new-post-label">
            Link
          </span>
        </label>
      </button>

      <Modal isOpen={ showModal }
             contentLabel="Example Modal"
             style={ formStyles }
             shouldCloseOnOverlayClick={ false }
             onRequestClose={ closeModal } >
             <div className="link-post-form">
               <span className="post-author">
                 { currentUser.username }
               </span>
               <div className="post-form">
                 <div className="title-field">
                   <textarea className="title-input"
                     type="text"
                     placeholder="Name/describe link here"
                     value={ title }
                     onChange={ e => setTitle(e.currentTarget.value) } />

                 </div>

                 <div className="post-body">
                   <textarea
                     className="body-input"
                     type="text"
                     placeholder="Type or paste Link URL here"
                     value={ url }
                     onChange={ e => setUrl(e.currentTarget.value) } />
                 </div>

                 <div className="submit-form">
                   <div className="form-errors">
                     <strong>{ renderErrors() }</strong>
                   </div>
                   <div className="modal-button">
                     <button
                       className="form-button"
                       onClick={ closeModal }>
                       Close
                     </button>
                     <button
                       className="post-submit-button"
                       onClick={ handleSubmit }
                       disabled={ !url } >
                       Post
                     </button>
                   </div>
                 </div>
               </div>
             </div>
      </Modal>
    </div>
  );
};

export default LinkForm;
