import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { routes } from '../../config/routes';
import { useCurrentUser, useLogout } from '../../query/session_hooks';

const ACCOUNT_MENU_ID = 'dashboard-account-menu';

const AccountMenu = () => {
  const currentUser = useCurrentUser().data;
  const logout = useLogout();
  const location = useLocation();
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = event => {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    };

    const handleKeyDown = event => {
      if (event.key !== 'Escape') return;

      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logout.mutate();
  };

  const handleBlur = event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
  };

  return (
    <div className="account-menu" onBlur={ handleBlur } ref={ menuRef }>
      <button
        aria-controls={ ACCOUNT_MENU_ID }
        aria-expanded={ isOpen }
        aria-haspopup="true"
        className="account-menu-trigger"
        onClick={ () => setIsOpen(open => !open) }
        ref={ triggerRef }
        type="button">
        { currentUser.username }
      </button>

      <div
        className="account-menu-popup"
        hidden={ !isOpen }
        id={ ACCOUNT_MENU_ID }>
        <Link to={ routes.settings } onClick={ () => setIsOpen(false) }>
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
