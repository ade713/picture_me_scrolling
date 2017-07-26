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
          <div className="bar-form-button">
            <TextFormContainer />
          </div>
          <div className="bar-form-button">
            <QuoteFormContainer />
          </div>
          <div className="bar-form-button">
            <PhotoFormContainer />
          </div>
          <div className="bar-form-button">
            <LinkFormContainer />
          </div>
          <div className="bar-form-button">
            <AudioFormContainer />
          </div>
          <div className="bar-form-button">
            <div className="last-bfb"><VideoFormContainer /></div>
          </div>
        </div>
      </div>
    );
  }
}

export default PostBar;


//inside bar : createPost={this.props.createPost}
