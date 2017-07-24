import React from 'react';

class Feed extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.requestAllPosts();
  }

  render() {
    const { posts, deletePost } = this.props;
    const feedItems = posts.map( post =>
      <FeedItem key={ post.id } deletePost={ deletePost } post= { post } />
    );

    return (
      <div className="feed-posts">
          <ul>
            { feedItems }
          </ul>
      </div>
    );
  }
}

export default Feed;
