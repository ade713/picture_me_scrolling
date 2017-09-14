import React from 'react';

class RecUserItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <li className="rec-user-item">
        <button 
          className="follow-user"
          onClick={ () => this.props.followUser(this.props.user.id) }>
          <i className="fa fa-plus-square" aria-hidden="true"></i>
        </button>
        <img 
          className="rec-user-avatar" 
          src={ this.props.user.avatar_url } />
        <h3 className="rec-username">
          { this.props.user.username }
        </h3>
      </li>
    );
  }
}

export default RecUserItem;