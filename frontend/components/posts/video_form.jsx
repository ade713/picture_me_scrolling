import React from 'react';
import Modal from 'react-modal';

const formStyles = {
  overlay : {
    position        : 'fixed',
    top             : 0,
    left            : 0,
    right           : 0,
    bottom          : 0,
    backgroundColor : 'rgba(211, 211, 211, 0.75)',
    zIndex          : 10,
  },

  content : {
    position        : 'fixed',
    height          : '300px',
    width           : '540px',
    top             : '20%',
    left            : '20%',
    padding         : '20px',
    border          : '1px solid #C0C0C0',
    borderRadius    : '4px',
    zIndex          : 11,
  }
};

class VideoForm {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      title: '',
      body: '',
      url: '',
      post_type: 'video',
      image: ''
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleMedia = this.handleMedia.bind(this);
  }

  update(property) {
    return e => this.setState({
      [property]: e.currentTarget.value
    });
  }

  openModal() {
    this.setState({
      showModal: true
    });
  }

  closeModal() {
    this.setState({
      showModal: false,
      title: '',
      body: '',
      url: '',
      image: ''
    });
  }

  handleMedia(e) {
    let reader = new FileReader();
    let file = e.currentTarget.files[0];
    reader.onloadend = function() {
      this.setState({
        url: reader.result,
        image: file
      });
    }.bind(this);

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  handleSubmit(e) {
    let formData = new FormData();
    formData.append('post[url]', this.state.url);
    formData.append('post[title]', this.state.title);
    formData.append('post[post_type]', 'video');
    formData.append('post[image]', 'image');
    this.props.createMediaPost(formData)
      .then(this.closeModal());
  }

  render() {
    return (
      <div className="post-bar-content">
        <button className="post-bar-button" onClick={ this.openModal }>
          <label className="bar-button">
            <div className="photo-icon">
              "Vi"
            </div>
            <span className="new-post-label">
              Video
            </span>
          </label>
        </button>

        <Modal isOpen={ this.state.showModal }
               contentLabel="Example Modal"
               style={ formStyles }
               onRequestClose={ this.closeModal } >
               <div className="new-post-form">
                 <span className="post-author">
                   { this.props.currentUser.username }
                 </span>
                 <div className="post-form">
                   <div className="media-field">
                     <input className="media-input"
                            type="file"
                            accept="video/*"
                            onChange={ this.handleMedia } />
                   </div>

                   <div className="title-field">
                     <textarea className="title-input"
                               type="text"
                               placeholder="Add caption here"
                               value={ this.state.title }
                               onChange={ this.update('title') } />
                   </div>

                   <div className="submit-form">
                     <div className="modal-button">
                       <button className="form-button"
                               onClick={ this.closeModal }>
                               Close
                       </button>
                       <button className="post-submit-button"
                               onClick={ this.handleSubmit }
                               disabled={ !this.state.url } >
                         Post
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
        </Modal>
      </div>
    );
  }
}

export default VideoForm;
