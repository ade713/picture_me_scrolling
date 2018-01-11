import React from 'react';

import RecommendedUsersContainer from './recommended_users_container';
import RecUserItem from './rec_user_item';


class RecommendedUsers extends React.Component {
  constructor(props) {
    super(props);
    console.log('RU', this.props);
  }

  componentDidMount() {
    this.props.requestUsers();
  }

  // shouldComponentUpdate(nextProps) {
  //   console.log(this.props.currentUser.followees_count !== nextProps.currentUser.followees_count);
  //   return (
  //     this.props.currentUser.followees_count !== nextProps.currentUser.followees_count
  //   );
  // }
  componentWillReceiveProps(nextProps) {
    console.log('fcount', nextProps.currentUser.followees_count);
    if (this.props.currentUser.followees_count !== nextProps.currentUser.followees_count) {
      this.props.requestUsers();
    }
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