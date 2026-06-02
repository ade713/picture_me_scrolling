import React from 'react';

import { useCurrentUser } from '../../query/session_hooks';
import { useDeletePost,
         useLikePost,
         useUnlikePost } from '../../query/post_hooks';
import { useFollowUser,
         useUnfollowUser } from '../../query/user_hooks';
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

const FeedItem = ({ post }) => {
  const currentUser = useCurrentUser();
  const deletePost = useDeletePost();
  const followUser = useFollowUser();
  const likePost = useLikePost();
  const unfollowUser = useUnfollowUser();
  const unlikePost = useUnlikePost();
  const isAuthor = Boolean(currentUser.data) && post.author_id === currentUser.data.id;

  const postHeader = (
    <PostHeader
      isAuthor={ isAuthor }
      onFollow={ id => followUser.mutate(id) }
      onUnfollow={ id => unfollowUser.mutate(id) }
      post={ post }
    />
  );

  const postFooter = (
    <PostFooter
      isAuthor={ isAuthor }
      onDelete={ deletedPost => deletePost.mutate(deletedPost) }
      onLike={ id => likePost.mutate(id) }
      onUnlike={ id => unlikePost.mutate(id) }
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
