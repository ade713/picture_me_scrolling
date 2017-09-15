import React from 'react';
import { Link } from 'react-router-dom';

import FeedContainer from '../feed/feed_container';
import RecommendedUsersContainer from '../users/recommended_users_container';


class Dashboard extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loggedIn) {
      this.props.history.push("/");
    }
  }

  render () {
    const { currentUser, logout } = this.props;

    return (
      <div className="dash-page">
        <header className="dash-nav">
          <h1 className="dash-title">
            PicMeS
          </h1>
          <button className="dash-logout" onClick={ logout }>Log Out</button>
        </header>
        <div className="dash-main">
          <div className="dash-feed">
            <FeedContainer />
          </div>
          <div className="dash-right-column">
            <RecommendedUsersContainer />
            <footer className="dash-right-footer">
              <a 
                href="https://github.com/ade713"
                target="_blank">
                <i 
                  className="fa fa-github" 
                  aria-hidden="true"></i>
              </a>
              <a 
                href="https://www.linkedin.com/in/ade-farquhar-2a66a233" 
                target="_blank">
                <i 
                  className="fa fa-linkedin-square"
                  aria-hidden="true"></i>
              </a>
            </footer>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
