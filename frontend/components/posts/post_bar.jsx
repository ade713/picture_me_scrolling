import React from 'react';

// import each form type here
import TextForm from './text_form';


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
          <TextForm />
        </div>
      </div>
    );
  }
}

export default PostBar;





// <PhotoForm />
// <QuoteForm />
// <LinkForm />
// <AudioForm />
// <VideoForm />
