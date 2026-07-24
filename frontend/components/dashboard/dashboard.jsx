import React from 'react';

import Feed from '../feed/feed';
import RecommendedUsers from '../users/recommended_users';
import AccountMenu from './account_menu';

const Dashboard = () => {
  return (
    <div className="dash-page">
      <header className="dash-nav">
        <h1 className="dash-title">
          PicMeS
        </h1>
        <AccountMenu />
      </header>
      <div className="dash-main">
        <div className="dash-feed">
          <Feed />
        </div>
        <div className="dash-right-column">
          <RecommendedUsers />
          <footer className="dash-right-footer">
            <a
              aria-label="GitHub profile"
              href="https://github.com/ade713"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub profile">
              <i
                className="fa fa-github"
                aria-hidden="true"></i>
            </a>
            <a
              aria-label="LinkedIn profile"
              href="https://www.linkedin.com/in/ade-farquhar"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn profile">
              <i
                className="fa fa-linkedin-square"
                aria-hidden="true"></i>
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
