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

  render () {
    const { currentUser, logout } = this.props;
    console.log(currentUser);
    return (
      <div className="dash-page">
        <navbar className="dash-nav">
          <h1 className="dash-title">
            Picture Me Scrolling
          </h1>
          <button className="dash-logout" onClick={ logout }>Log Out</button>
        </navbar>
      </div>
    );
  }
}

export default Dashboard;
