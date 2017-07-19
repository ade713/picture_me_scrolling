import React from 'react';
import { Link } from 'react-router-dom';

const sessionLinks = () => (
  <nav className="login-signup">
    <Link to="/login">Login</Link>
    <br />
    <Link to="/signup">Sign Up</Link>
  </nav>
);

const personalGreet = (currentUser, logout) => (
  <hgroup className="header-group">
    <h2 className="header-name">
      Welcome to Picture Me Scrolling {currentUser.username}
    </h2>
    <button className="header-button" onClick={ logout }>Log Out</button>
  </hgroup>
);

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    const { currentUser, logout } = this.props;

    return (
      currentUser ? personalGreet(currentUser, logout) : sessionLinks()
    );
  }
}

export default Dashboard;
