import React, { useState } from 'react';
import Modal from 'react-modal';

import { useCreateMediaPost } from '../../query/post_hooks';
import { FormErrors, ModalButtonFooter } from './post_form_controls';
import { usePostFormProps } from './post_form_hooks';

const PhotoForm = () => {
  const createMediaPostMutation = useCreateMediaPost();
  const { clearErrors, createMediaPost, currentUser, errors, isSubmitting } = usePostFormProps(createMediaPostMutation);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTitle('');
    setBody('');
    setUrl('');
    setImageFile(null);
    setImageUrl(null);
    clearErrors();
  };

  const handleMedia = e => {
    const reader = new FileReader();
    const file = e.currentTarget.files[0];

    reader.onloadend = () => {
      setImageUrl(reader.result);
      setImageFile(file);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!imageFile) return;

    const formData = new FormData();
    formData.append('post[url]', url);
    formData.append('post[title]', title);
    formData.append('post[post_type]', 'photo');
    formData.append('post[body]', body);
    formData.append('post[image]', imageFile);

    createMediaPost(formData).then(result => {
      if (result) closeModal();
    });
  };

  return (
    <div className="post-bar-content">
      <button className="post-bar-button" onClick={ openModal }>
        <div className="bar-button">
          <div className="button-icon">
            <i className="fa fa-camera fa-3x" aria-hidden="true"></i>
          </div>
          <span className="new-post-label">
            Photo
          </span>
        </div>
      </button>

      <Modal isOpen={ showModal }
             contentLabel="Photo post form"
             className="post-form-modal"
             overlayClassName="post-form-modal-overlay"
             shouldCloseOnOverlayClick={ false }
             onRequestClose={ closeModal } >
             <div className="photo-post-form">
               <div className="post-form">
                  <span className="post-author">
                    { currentUser.username }
                  </span>
                 <div className="media-field">
                   <input className="media-input"
                          type="file"
                          accept="image/*"
                          onChange={ handleMedia } />
                   { imageUrl && (
                     <img
                       alt="Selected upload preview"
                       src={ imageUrl } />
                   ) }
                 </div>

                 <div className="title-field">
                   <textarea className="title-input"
                             placeholder="Upload Photo above&#10;Add Photo caption here"
                             value={ title }
                             onChange={ e => setTitle(e.currentTarget.value) } />
                 </div>

                 <div className="submit-form">
                   <FormErrors errors={ errors } />
                   <ModalButtonFooter
                     disabled={ !imageFile || isSubmitting }
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

export default PhotoForm;
