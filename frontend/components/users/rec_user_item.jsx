import React from 'react';

class RecUserItem extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }

  followUser() {
    this.props.followUser(this.props.user.id);
    this.props.requestUsers();
  }

  render() {
    return (
      <li className="rec-user-item">
        <div className="rec-user-block">
          <img 
            className="rec-user-avatar" 
            src={ this.props.user.avatar_url } />
          <span className="rec-username">
            { this.props.user.username }
          </span>
        </div>
        <button 
          className="follow-user"
          onClick={ () => this.followUser() }>
          <i className="fa fa-plus-square" aria-hidden="true"></i>
        </button>
      </li>
    );
  }
}

export default RecUserItem;
