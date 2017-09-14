import React from 'react';

class RecUserItem extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }

  render() {
    return (
      <div className="rec-user-item">
        <button 
          className="follow-user"
          onClick={ () => this.props.followUser(this.props.user.id) }>
          <i className="fa fa-plus-square" aria-hidden="true"></i>
        </button>
        <img 
          className="user-avatar" 
          src={ this.props.user.avatar_url } />
        <h3 >
          { this.props.user.username }
        </h3>
      </div>
    );
  }
}

export default RecUserItem;