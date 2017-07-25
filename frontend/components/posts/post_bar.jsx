import React from 'react';

// import each form type here
import TextFormContainer from './text_form_container';
// import PhotoForm from './photo_form';
import QuoteForm from './quote_form';
import LinkForm from './link_form';
// import AudioForm from './audio_form';
// import VideoForm from './video_form';



class PostBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { currentUser } = this.props;

    return (
      <div className="post-bar">
        <img className="user-avatar" src={ this.props.currentUser.avatar_url } />
        <div className="post-form-links">
          <TextFormContainer />
          <QuoteForm />
        </div>
      </div>
    );
  }
}

export default PostBar;


//inside bar : createPost={this.props.createPost}
