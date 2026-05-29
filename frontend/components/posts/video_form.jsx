import React, { useState } from 'react';
import Modal from 'react-modal';

import formStyles from './modal_style';

const VideoForm = ({ clearErrors, createMediaPost, currentUser, errors }) => {
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
    formData.append('post[post_type]', 'video');
    formData.append('post[body]', body);
    formData.append('post[image]', imageFile);

    createMediaPost(formData).then(closeModal);
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
      <button
        className="post-bar-button"
        onClick={ openModal }>
        <label className="bar-button">
          <div className="button-icon">
            <i className="fa fa-video-camera fa-3x" aria-hidden="true"></i>
          </div>
          <span className="new-post-label">
            Video
          </span>
        </label>
      </button>

      <Modal
        isOpen={ showModal }
        contentLabel="Example Modal"
        style={ formStyles }
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
                     accept="video/*"
                     onChange={ handleMedia } />
                 </div>

                 <div className="title-field">
                   <textarea className="title-input"
                             type="text"
                             placeholder="Upload Video above&#10;Add Video caption here"
                             value={ title }
                             onChange={ e => setTitle(e.currentTarget.value) } />
                 </div>

                 <video width="500" height="160" controls>
                   <source src={ imageUrl } type="video/*" />
                 </video>

                 <div className="submit-form">
                   <div className="form-errors">
                     <strong>{ renderErrors() }</strong>
                   </div>

                   <div className="modal-button">
                     <button className="form-button"
                             onClick={ closeModal }>
                             Close
                     </button>
                     <button className="post-submit-button"
                             onClick={ handleSubmit }
                             disabled={ !imageFile } >
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

export default VideoForm;
