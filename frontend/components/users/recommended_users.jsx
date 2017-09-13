import React from 'react';

import RecommendedUsersContainer from './recommended_users_container';
import RecUserItem from './rec_user_item';


class RecommendedUsers extends React.Component {
  constructor(props) {
    super(props);
    console.log('P', this.props);
  }

  componentDidMount() {
    this.props.requestUsers();
  }

  render() {
    const { users, followUser } = this.props;

    const recUsers = users.map(user => 
      <RecUserItem 
        key={user.id}
        user={ user }
        followUser={ followUser } />
    );

    return (
      <div className="recm-users">
        <h2 className="rec-users-title">
          RecommendedUsers
        </h2>
        <ul>
          { recUsers }
        </ul>
      </div>
    );
  }
}

export default RecommendedUsers;