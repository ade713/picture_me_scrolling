import React from 'react';
import { Link } from 'react-router-dom';

const sessionLinks = () => (
  <nav className="login-signup">
    <Link to="/login">Login</Link>
    &nbsp;or&nbsp;
    <Link to="/signup">Sign Up</Link>
  </nav>
);

const personalGreeting = (currentUser, logout) => (
  <hgroup className="header-group">
    <h2 className="header-name">
      Welcome to Picture Me Scrolling {currentUser.username}
    </h2>
    <button className="header-button" onClick={ logout }>Log Out</button>
  </hgroup>
);

class Greeting extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    const { currentUser, logout } = this.props;

    return (
      currentUser ? personalGreeting(currentUser, logout) : sessionLinks()
    );
  }
}

export default Greeting;
