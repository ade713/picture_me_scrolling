import React from 'react';
import { Link } from 'react-router-dom';

import { commentDateOptions, commentMessages } from '../../config/comments';
import { routes } from '../../config/routes';

const CommentItem = ({ comment }) => (
  <li className="comment-item">
    {comment.deleted ? (
      <p className="comment-deleted">{commentMessages.deleted}</p>
    ) : (
      <>
        <div className="comment-identity">
          <Link className="comment-author" to={routes.userProfile(comment.author.id)}>
            <img src={comment.author.avatar_url} alt="" loading="lazy" />
            <span>{comment.author.username}</span>
          </Link>
          <time dateTime={comment.created_at}>
            {new Date(comment.created_at).toLocaleString(undefined, commentDateOptions)}
          </time>
        </div>
        <p className="comment-body">{comment.body}</p>
      </>
    )}
    {comment.reply_count > 0 && (
      <p className="comment-reply-count">{commentMessages.replyCount(comment.reply_count)}</p>
    )}
  </li>
);

export default CommentItem;
