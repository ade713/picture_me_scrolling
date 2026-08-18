import React from 'react';
import { Link } from 'react-router-dom';

import { APP_NAME } from '../../config/app';
import { routes } from '../../config/routes';

const PasswordRecoveryLayout = ({ children, headingId }) => (
  <div className="password-recovery-page">
    <header className="password-recovery-nav">
      <Link to={routes.home}>{APP_NAME}</Link>
    </header>

    <main>
      <section
        aria-labelledby={headingId}
        className="password-recovery-card"
      >
        {children}
      </section>
    </main>
  </div>
);

export default PasswordRecoveryLayout;
