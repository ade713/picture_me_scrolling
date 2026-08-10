import React, { useState } from 'react';
import Modal from 'react-modal';

import { postTypeLabels, postTypes } from '../../config/post_types';
import { useCreateMediaPost } from '../../query/post_hooks';
import buildMediaPostFormData from './media_post_form_data';
import { FormErrors, ModalButtonFooter } from './post_form_controls';
import { usePostFormProps } from './post_form_hooks';
import TagInput from './tag_input';
import useTagInput from './use_tag_input';

const PhotoForm = () => {
  const createMediaPostMutation = useCreateMediaPost();
  const {
    clearErrors,
    createMediaPost,
    currentUser,
    errors,
    isSubmitting
  } = usePostFormProps(createMediaPostMutation);
  const tagInput = useTagInput();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTitle('');
    setImageFile(null);
    setImageUrl(null);
    tagInput.reset();
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
    const tags = tagInput.commitDraft();
    if (!tags) return;

    const formData = buildMediaPostFormData({
      file: imageFile,
      postType: postTypes.photo,
      tags,
      title
    });

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
            {postTypeLabels[postTypes.photo]}
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
                          aria-label="Choose photo file"
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
                             aria-label="Photo caption"
                             placeholder="Upload Photo above&#10;Add Photo caption here"
                             value={ title }
                             onChange={ e => setTitle(e.currentTarget.value) } />
                 </div>

                 <TagInput
                   disabled={isSubmitting}
                   {...tagInput.inputProps}
                 />

                 <div className="submit-form">
                   <FormErrors errors={ errors } />
                   <ModalButtonFooter
                     disabled={ !imageFile || tagInput.hasError || isSubmitting }
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
