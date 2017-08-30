import React from 'react';
import { Link } from 'react-router-dom';

import FeedContainer from '../feed/feed_container';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    setTimeout(() => this.setState({
      loading: false
    }), 1500);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loggedIn) {
      this.props.history.push("/");
    }
  }

  render () {
    const { currentUser, logout } = this.props;

      if (this.state.loading) {
        return (
          <div className="dash-page">
            <header className="dash-nav">
              <h1 className="dash-title">
                PicMeS
            </h1>
              <button className="dash-logout" onClick={logout}>Log Out</button>
            </header>
            <div className="sk-folding-cube">
              <div className="sk-cube1 sk-cube"></div>
              <div className="sk-cube2 sk-cube"></div>
              <div className="sk-cube4 sk-cube"></div>
              <div className="sk-cube3 sk-cube"></div>
            </div>
          </div>
        );
      } else {
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

            </div>
          </div>
        </div>
      );
    }
  }
}

export default Dashboard;
