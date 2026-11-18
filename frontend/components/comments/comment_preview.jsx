import React from 'react';
import { Link } from 'react-router-dom';

import { commentMessages } from '../../config/comments';
import { routes } from '../../config/routes';
import PostDetailLink from '../feed/post_detail_link';

const CommentPreview = ({ postId, comments = [] }) => (
  <div className="comment-preview">
    {comments.length > 0 && (
      <ul aria-label={commentMessages.previewLabel}>
        {comments.map(comment => (
          <li key={comment.id}>
            <Link className="comment-preview-author" to={routes.userProfile(comment.author.id)}>
              <img src={comment.author.avatar_url} alt="" loading="lazy" decoding="async" />
              <span>{comment.author.username}</span>
            </Link>
            <p className="comment-preview-body">{comment.body}</p>
          </li>
        ))}
      </ul>
    )}
    <PostDetailLink postId={postId}>
      {comments.length ? commentMessages.viewAll : commentMessages.formLabel}
    </PostDetailLink>
  </div>
);

export default CommentPreview;
