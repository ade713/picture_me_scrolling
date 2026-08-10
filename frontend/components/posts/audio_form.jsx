import React, { useState } from 'react';
import Modal from 'react-modal';

import { postTypeLabels, postTypes } from '../../config/post_types';
import { useCreateMediaPost } from '../../query/post_hooks';
import buildMediaPostFormData from './media_post_form_data';
import { FormErrors, ModalButtonFooter } from './post_form_controls';
import { usePostFormProps } from './post_form_hooks';
import TagInput from './tag_input';
import useTagInput from './use_tag_input';

const AudioForm = () => {
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
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTitle('');
    setAudioFile(null);
    setAudioUrl(null);
    tagInput.reset();
    clearErrors();
  };

  const handleMedia = e => {
    const reader = new FileReader();
    const file = e.currentTarget.files[0];

    reader.onloadend = () => {
      setAudioUrl(reader.result);
      setAudioFile(file);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!audioFile) return;
    const tags = tagInput.commitDraft();
    if (!tags) return;

    const formData = buildMediaPostFormData({
      file: audioFile,
      postType: postTypes.audio,
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
            <i className="fa fa-headphones fa-3x" aria-hidden="true"></i>
          </div>
          <span className="new-post-label">
            {postTypeLabels[postTypes.audio]}
          </span>
        </div>
      </button>

      <Modal isOpen={ showModal }
             contentLabel="Audio post form"
             className="post-form-modal"
             overlayClassName="post-form-modal-overlay"
             shouldCloseOnOverlayClick={ false }
             onRequestClose={ closeModal } >
             <div className="audio-post-form">
               <div className="post-form">
                 <div className="media-field">
                   <span className="post-author">
                     { currentUser.username }
                   </span>

                   <input className="media-input"
                          type="file"
                          aria-label="Choose audio file"
                          accept="audio/*"
                          onChange={ handleMedia } />
                 </div>
                 <div className="title-field">
                   <textarea
                     className="title-input"
                     aria-label="Audio caption"
                     placeholder="Upload Audio/Song above&#10;Add Audio/Song caption here"
                     value={ title }
                     onChange={ e => setTitle(e.currentTarget.value) } />
                 </div>

                 { audioUrl && (
                   <audio controls>
                     <source src={ audioUrl } />
                   </audio>
                 ) }

                 <TagInput
                   disabled={isSubmitting}
                   {...tagInput.inputProps}
                 />

                 <div className="submit-form">
                   <FormErrors errors={ errors } />
                   <ModalButtonFooter
                     disabled={ !audioFile || tagInput.hasError || isSubmitting }
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

export default AudioForm;
