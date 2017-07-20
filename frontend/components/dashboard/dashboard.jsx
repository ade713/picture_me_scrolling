import React from 'react';
import { Link } from 'react-router-dom';


class Dashboard extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loggedIn) {
      this.props.history.push("/");
    }
  }

  personalGreet (currentUser, logout) {
    return (
      <hgroup className="header-group">
        <h2 className="header-name">
          Welcome to Picture Me Scrolling { currentUser.username }
        </h2>
        <button className="header-button" onClick={ logout }>Log Out</button>
      </hgroup>
    );
  }


  render () {
    const { currentUser, logout } = this.props;

    return (
      <hgroup className="header-group">
        <h2 className="header-name">
          Welcome to Picture Me Scrolling
        </h2>
        <button className="header-button" onClick={ logout }>Log Out</button>
      </hgroup>
    );
  }
}

export default Dashboard;
