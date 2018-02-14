import React from 'react';

class Comments extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      body: '',
      post_id: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const comment = {
      body: this.state.body,
      post_id: this.props.post_id // get post_id from props
    };

    this.props.createCommment(comment);
  }

  update(property) {
    return e => this.setState({
      [property]: e.target.value
    });
  }

  renderErrors() {
    return (
      <ul>
        {
          this.props.errors.map((error, index) => (
            <li key={ `error-${ index }` }>
              { error }
            </li>
          ))
        }
      </ul>
    );
  }

  return(){
    const { comments } = this.props;

    const commentItems = comments.map(comment => 
      <CommentItem 
        key={ comment.id } 
        deleteComment={ this.props.deleteComment }
        editComment={ this.props.editComment }/>
    );
    
    return (
      <div className="post-comments">
        <ul className="comments-list">
          { commentItems }
        </ul>
        <form className="comment-form">
          <div className="">
            <textarea className="comment-body-input" 
                      type="text" 
                      placeholder="Write a comment..."
                      value={ this.state.body } 
                      onChange={ this.update('body') }
                       />
            <button className="comment-button" 
                    onClick={ this.handleSubmit }
                    disabled={ !this.state.body }>
              Post
            </button>
          </div>
          
          <div className="comment-errors">
            <strong>{ this.renderErrors() }</strong>
          </div>
        </form>
      </div>
    );
  }
}

export default Comments;
