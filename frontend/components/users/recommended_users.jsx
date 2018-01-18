import React from 'react';

import RecommendedUsersContainer from './recommended_users_container';
import RecUserItem from './rec_user_item';


class RecommendedUsers extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.requestUsers();
  }

  render() {
    
    const { users, followUser, requestPosts, requestUsers } = this.props;

    console.log('RecU', users);
    
    const recUsers = users.map((user) => 
      <RecUserItem 
        key={ user.id }
        user={ user }
        followUser={ followUser }
        requestUsers={ requestUsers }
        requestPosts={ requestPosts } />
    );

    return (
      <div className="rec-users">
        <h2 className="rec-users-title">
          Recommended Users
        </h2>
        <ul className="rec-users-list">
          { recUsers }
        </ul>
      </div>
    );
  }
}

export default RecommendedUsers;
