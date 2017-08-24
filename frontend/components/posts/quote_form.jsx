import React from 'react';
import Modal from 'react-modal';

import formStyles from './modal_style';


class QuoteForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      title: '',
      body: '',
      url: '',
      post_type: 'quote'
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
      title: `"${this.state.title}"`,
      body: `- ${this.state.body}`,
      url: this.state.url,
      post_type: 'quote'
    };

    this.props.createPost(post)
      .then(this.closeModal());
  }

  render() {
    return (
      <div className="post-bar-content">
        <button className="post-bar-button" onClick={ this.openModal }>
          <label className="bar-button">
            <div className="button-icon">
              <i className="fa fa-quote-left fa-3x" aria-hidden="true"></i>
            </div>
            <span className="new-post-label">
              Quote
            </span>
          </label>
        </button>

        <Modal isOpen={ this.state.showModal }
               contentLabel="Example Modal"
               style={ formStyles }
               shouldCloseOnOverlayClick={ false }
               onRequestClose={ this.closeModal } >
               <div className="new-post-form">
                 <span className="post-author">
                   { this.props.currentUser.username }
                 </span>
                 <div className="quote-post-form">
                   <div className="title-field">
                     <textarea className="title-input"
                               type="text"
                               placeholder="Quote"
                               value={ this.state.title }
                               onChange={ this.update('title') } />

                   </div>
                   <div className="post-body">
                     <textarea className="body-input"
                       type="text"
                       placeholder="Source"
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
                               disabled={ !this.state.title }
                               disabled={ !this.state.body } >
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

export default QuoteForm;
