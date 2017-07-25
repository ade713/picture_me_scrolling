import React from 'react';
import { Link } from 'react-router-dom';

import FeedContainer from '../feed/feed_container';

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
            Picture Me Scrolling
          </h1>
          <button className="dash-logout" onClick={ logout }>Log Out</button>
        </header>
        <div className="dash-main">
          <div className="dash-feed">
            <FeedContainer />
          </div>
          <div className="dash-right-column">

          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
