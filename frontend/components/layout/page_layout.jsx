import React from 'react';
import { Link } from 'react-router-dom';

import { APP_NAME, BACK_TO_DASHBOARD_LABEL } from '../../config/app';
import { routes } from '../../config/routes';
import AccountMenu from '../dashboard/account_menu';

const PageLayout = ({
  children,
  className,
  backDestination = routes.dashboard,
  backLabel = BACK_TO_DASHBOARD_LABEL,
  onBackClick
}) => (
  <div className={`page-layout${className ? ` ${className}` : ''}`}>
    <header className="page-layout-nav">
      <Link className="page-layout-brand" to={routes.dashboard}>{APP_NAME}</Link>
      <AccountMenu />
    </header>
    <main className="page-layout-main">
      <Link
        className="page-layout-back-link"
        to={backDestination}
        onClick={onBackClick}
      >
        <span aria-hidden="true">←</span>
        {backLabel}
      </Link>
      {children}
    </main>
  </div>
);

export default PageLayout;
