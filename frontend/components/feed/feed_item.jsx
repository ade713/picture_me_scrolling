import React, { useState } from 'react';

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
import EditPostForm from '../posts/edit_post_form';

const POST_BODY_COMPONENTS = {
  audio: AudioPost,
  link: LinkPost,
  photo: PhotoPost,
  quote: QuotePost,
  text: TextPost,
  video: VideoPost
};

const FeedItem = ({ post, priorityMedia = false }) => {
  const currentUser = useCurrentUser();
  const deletePost = useDeletePost();
  const followUser = useFollowUser();
  const likePost = useLikePost();
  const unfollowUser = useUnfollowUser();
  const unlikePost = useUnlikePost();
  const [editingPost, setEditingPost] = useState(null);
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
      onEdit={ editedPost => setEditingPost(editedPost) }
      onLike={ id => likePost.mutate(id) }
      onUnlike={ id => unlikePost.mutate(id) }
      post={ post }
    />
  );
  const PostBody = POST_BODY_COMPONENTS[post.post_type] || TextPost;

  return (
    <PostFrame
      post={ post }
      priorityMedia={ priorityMedia }>
      <PostBody
        footer={ postFooter }
        header={ postHeader }
        post={ post }
        priorityMedia={ priorityMedia }
      />
      { editingPost && (
        <EditPostForm
          isOpen={ Boolean(editingPost) }
          onClose={ () => setEditingPost(null) }
          post={ editingPost }
        />
      ) }
    </PostFrame>
  );
};

export default React.memo(FeedItem);
