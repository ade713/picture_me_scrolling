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
    height          : '230px',
    width           : '540px',
    top             : '20%',
    left            : '20%',
    padding         : '20px',
    border          : '1px solid #C0C0C0',
    borderRadius    : '4px',
    zIndex          : 11,
  }
};

class LinkForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      title: '',
      body: '',
      url: '',
      post_type: 'link'
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
      post_type: ''
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const post = {
      title: this.state.title,
      body: this.state.body,
      url: this.state.url,
      post_type: 'link'
    };

    this.props.createPost(post)
      .then(this.closeModal());
  }

  render() {
    return (
      <div className="post-bar-content">
        <button className="post-bar-button" onClick={ this.openModal }>
          <label className="bar-button">
            <div className="link-icon">
              "Li"
            </div>
            <span className="new-post-label">
              Link
            </span>
          </label>
        </button>

        <Modal isOpen={ this.state.showModal }
               contentLabel="Example Modal"
               style={ formStyles }
               onRequestClose={ this.closeModal } >
               <div className="new-post-form">
                 <div className="post-form">
                   <div className="post-body">
                     <textarea className="body-input"
                       type="text"
                       placeholder="Type or paste URL here"
                       value={ this.state.url }
                       onChange={ this.update('url') } />
                   </div>
                   <div className="title-field">
                     <span className="post-author">
                       { this.props.currentUser.username }
                     </span>
                     <textarea className="title-input"
                       type="text"
                       placeholder="Describe link here"
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
                               disabled={ !this.state.title && !this.state.url } >
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

export default LinkForm;