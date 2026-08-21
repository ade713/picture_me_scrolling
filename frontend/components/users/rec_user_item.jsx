import React from 'react';
import { Link } from 'react-router-dom';

import { buttonActionLabels } from '../../config/button_labels';
import { routes } from '../../config/routes';

const followActionLabel = user => buttonActionLabels.followUser(user.username);

const RecUserItem = ({ followUser, user }) => (
  <li className="rec-user-item">
    <Link className="rec-user-block" to={routes.userProfile(user.id)}>
      <img
        alt=""
        className="rec-user-avatar"
        src={ user.avatar_url } />
      <span className="rec-username">
        { user.username }
      </span>
    </Link>
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
