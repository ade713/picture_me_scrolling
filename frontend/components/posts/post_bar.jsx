import React from 'react';

import TextFormContainer from './text_form_container';
import PhotoFormContainer from './photo_form_container';
import QuoteFormContainer from './quote_form_container';
import LinkFormContainer from './link_form_container';
import AudioFormContainer from './audio_form_container';
import VideoFormContainer from './video_form_container';



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
          <PhotoFormContainer />
          <QuoteFormContainer />
          <LinkFormContainer />
          <AudioFormContainer />
          <VideoFormContainer />
        </div>
      </div>
    );
  }
}

export default PostBar;


//inside bar : createPost={this.props.createPost}
