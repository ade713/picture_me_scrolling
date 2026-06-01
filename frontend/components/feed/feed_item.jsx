import React from 'react';

import { AudioPost,
         LinkPost,
         PhotoPost,
         QuotePost,
         TextPost,
         VideoPost } from './feed_item_post_bodies';
import { PostFooter,
         PostFrame,
         PostHeader } from './feed_item_parts';

const POST_BODY_COMPONENTS = {
  audio: AudioPost,
  link: LinkPost,
  photo: PhotoPost,
  quote: QuotePost,
  text: TextPost,
  video: VideoPost
};

const FeedItem = ({
  currentUser,
  deletePost,
  followUser,
  likePost,
  post,
  unfollowUser,
  unlikePost
}) => {
  const isAuthor = post.author_id === currentUser.id;

  const postHeader = (
    <PostHeader
      isAuthor={ isAuthor }
      onFollow={ followUser }
      onUnfollow={ unfollowUser }
      post={ post }
    />
  );

  const postFooter = (
    <PostFooter
      isAuthor={ isAuthor }
      onDelete={ deletePost }
      onLike={ likePost }
      onUnlike={ unlikePost }
      post={ post }
    />
  );
  const PostBody = POST_BODY_COMPONENTS[post.post_type] || TextPost;

  return (
    <PostFrame post={ post }>
      <PostBody
        footer={ postFooter }
        header={ postHeader }
        post={ post }
      />
    </PostFrame>
  );
};

export default FeedItem;
