import React from 'react';

class RecUserItem extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }

  render() {
    return (
      <div className="rec-user-item">
        <i className="fa fa-plus-square" aria-hidden="true"></i>
        
        <h3>rec_user_name</h3>
      </div>
    );
  }
}

export default RecUserItem;