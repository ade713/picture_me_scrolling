import React from 'react';

import RecommendedUsersContainer from './recommended_users_container';

class RecommendedUsers extends React.Component {
  constructor(props) {
    super(props);
    console.log('props', this.props);
  }

  componentDidMount() {
    this.props.requestUsers();
  }

  render() {
    const { users } = this.props;
    console.log('REC', users);

    const userItems = users.map(user => 
      <RecommendedUsersContainer 
        key={user.id}
        user={ user } />
    );

    return (
      <div className="recm-users">
        <h2 className="rec-users-title">
          RecommendedUsers
        </h2>
        <ul>
          { userItems }
        </ul>
      </div>
    );
  }
}

export default RecommendedUsers;