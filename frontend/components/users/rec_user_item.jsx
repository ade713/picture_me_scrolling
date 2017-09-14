import React from 'react';

class RecUserItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <li className="rec-user-item">
        <div className="rec-user-block">
          <img 
            className="rec-user-avatar" 
            src={ this.props.user.avatar_url } />
          <h3 className="rec-username">
            { this.props.user.username }
          </h3>
        </div>
        <button 
          className="follow-user"
          onClick={ () => this.props.followUser(this.props.user.id) }>
          <i className="fa fa-plus-square" aria-hidden="true"></i>
        </button>
      </li>
    );
  }
}

export default RecUserItem;