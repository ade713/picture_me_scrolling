import React from 'react';

const RecUserItem = ({ followUser, user }) => (
  <li className="rec-user-item">
    <div className="rec-user-block">
      <img
        alt={ `${user.username} avatar` }
        className="rec-user-avatar"
        src={ user.avatar_url } />
      <span className="rec-username">
        { user.username }
      </span>
    </div>
    <button
      aria-label={ `Follow ${user.username}` }
      className="follow-user"
      onClick={ () => followUser(user.id) }>
      <i className="fa fa-plus-square" aria-hidden="true"></i>
    </button>
  </li>
);

export default RecUserItem;
