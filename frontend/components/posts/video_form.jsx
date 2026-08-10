import React, { useState } from 'react';
import Modal from 'react-modal';

import { postTypeLabels, postTypes } from '../../config/post_types';
import { useCreateMediaPost } from '../../query/post_hooks';
import buildMediaPostFormData from './media_post_form_data';
import { FormErrors, ModalButtonFooter } from './post_form_controls';
import { usePostFormProps } from './post_form_hooks';
import TagInput from './tag_input';
import useTagInput from './use_tag_input';

const VideoForm = () => {
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
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTitle('');
    setVideoFile(null);
    setVideoUrl(null);
    tagInput.reset();
    clearErrors();
  };

  const handleMedia = e => {
    const reader = new FileReader();
    const file = e.currentTarget.files[0];

    reader.onloadend = () => {
      setVideoUrl(reader.result);
      setVideoFile(file);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!videoFile) return;
    const tags = tagInput.commitDraft();
    if (!tags) return;

    const formData = buildMediaPostFormData({
      file: videoFile,
      postType: postTypes.video,
      tags,
      title
    });

    createMediaPost(formData).then(result => {
      if (result) closeModal();
    });
  };

  return (
    <div className="post-bar-content">
      <button
        className="post-bar-button"
        onClick={ openModal }>
        <div className="bar-button">
          <div className="button-icon">
            <i className="fa fa-video-camera fa-3x" aria-hidden="true"></i>
          </div>
          <span className="new-post-label">
            {postTypeLabels[postTypes.video]}
          </span>
        </div>
      </button>

      <Modal
        isOpen={ showModal }
        contentLabel="Video post form"
        className="post-form-modal"
        overlayClassName="post-form-modal-overlay"
        shouldCloseOnOverlayClick={ false }
        onRequestClose={ closeModal } >
             <div className="video-post-form">
               <span className="post-author">
                 { currentUser.username }
               </span>
               <div className="post-form">
                 <div className="media-field">
                   <input
                     className="media-input"
                     type="file"
                     aria-label="Choose video file"
                     accept="video/*"
                     onChange={ handleMedia } />
                 </div>

                 <div className="title-field">
                   <textarea className="title-input"
                             aria-label="Video caption"
                             placeholder="Upload Video above&#10;Add Video caption here"
                             value={ title }
                             onChange={ e => setTitle(e.currentTarget.value) } />
                 </div>

                 { videoUrl && (
                   <video controls key={ videoUrl }>
                     <source src={ videoUrl } type={ videoFile.type } />
                   </video>
                 ) }

                 <TagInput
                   disabled={isSubmitting}
                   {...tagInput.inputProps}
                 />

                 <div className="submit-form">
                   <FormErrors errors={ errors } />
                   <ModalButtonFooter
                     disabled={ !videoFile || tagInput.hasError || isSubmitting }
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

export default VideoForm;
