import React from 'react';

import { buttonActionLabels } from '../../config/button_labels';

const followActionLabel = user => buttonActionLabels.followUser(user.username);

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
      aria-label={ followActionLabel(user) }
      className="follow-user"
      onClick={ () => followUser(user.id) }
      title={ followActionLabel(user) }>
      <i className="fa fa-plus-square" aria-hidden="true"></i>
    </button>
  </li>
);

export default React.memo(RecUserItem);
