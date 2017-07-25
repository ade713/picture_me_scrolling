import React from 'react';
import Modal from 'react-modal';
import { withRouter } from 'react-router-dom';


const formStyles = {
  overlay : {
    position        : 'fixed',
    top             : 0,
    left            : 0,
    right           : 0,
    bottom          : 0,
    backgroundColor : 'rgba(211, 211, 211, 0.85)',
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

class  TextForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      title: '',
      body: '',
      source: '',
      post_type: 'text'
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  update(property) {
    return e => this.setState({
      [property]: e.currentTarget.value,
    });
  }

  openModal() {
    this.setState({ showModal: true });
  }

  closeModal() {
    this.setState({
      showModal: false,
      title: '',
      body: '',
      source: '',
      post_type: ''
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const post = {
      this: this.state.title,
      body: this.state.body,
      url: this.state.url,
      post_type: this.state.post_type
    };

    this.props.createPost(post)
    .then(this.closeModal());
  }

  render() {
    return (
      <div className="text">
        <button className="post-bar-button" onClick={ this.openModal }>
          <label className="bar-button">
            <div className="text-icon">
              Aa
            </div>
            <span className="new-post-label">
              Text
            </span>
          </label>
        </button>

        <Modal isOpen={ this.state.showModal }
               contentLabel="Example Modal"
               style={ formStyles }
               onRequestClose={ this.closeModal } >
               <div className="new-post-form">
                 <div className="post-form">
                   <div className="title-field">
                     <span className="post-author">
                      Current User
                     </span>
                     <textarea className="title-input"
                               type="text"
                               placeholder="Title"
                               value={ this.state.title }
                               onChange={ this.update('title') } />

                   </div>
                   <div className="post-body">
                     <textarea className="body-input"
                       type="text"
                       placeholder="Your text here"
                       value={ this.state.body }
                       onChange={ this.update('body') } />
                   </div>
                   <div className="submit-form">
                     <div className="modal-button">
                       <button className="form-button"
                               onClick={ this.closeModal }>
                               Close
                       </button>
                       <button className="post-submit-button"
                               onClick={ this.handleSubmit }
                               disabled={ !this.state.title && !this.state.body } >
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



export default withRouter(TextForm);
