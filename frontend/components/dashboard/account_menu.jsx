import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useCurrentUser, useLogout } from '../../query/session_hooks';

const ACCOUNT_MENU_ID = 'dashboard-account-menu';

const AccountMenu = () => {
  const currentUser = useCurrentUser().data;
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setIsOpen(false);
    logout.mutate();
  };

  return (
    <div className="account-menu">
      <button
        aria-controls={ ACCOUNT_MENU_ID }
        aria-expanded={ isOpen }
        aria-haspopup="true"
        className="account-menu-trigger"
        onClick={ () => setIsOpen(open => !open) }
        type="button">
        { currentUser.username }
      </button>

      <div
        className="account-menu-popup"
        hidden={ !isOpen }
        id={ ACCOUNT_MENU_ID }>
        <Link to="/settings" onClick={ () => setIsOpen(false) }>
          Settings
        </Link>
        <button
          disabled={ logout.isPending }
          onClick={ handleLogout }
          type="button">
          { logout.isPending ? 'Logging out…' : 'Log Out' }
        </button>
      </div>
    </div>
  );
};

export default AccountMenu;
