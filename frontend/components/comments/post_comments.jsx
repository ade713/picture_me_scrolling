import React, { useId } from 'react';

import { buttonLabels } from '../../config/button_labels';
import { commentMessages } from '../../config/comments';
import { usePostComments } from '../../query/comment_hooks';
import LoadingIndicator from '../loading/loading_indicator';
import AutomaticPagination from '../pagination/automatic_pagination';
import CommentItem from './comment_item';

const PostComments = ({ postId }) => {
  const headingId = useId();
  const query = usePostComments(postId);
  const comments = query.data?.comments || [];

  const renderComments = () => {
    if (query.isPending) return <LoadingIndicator label={commentMessages.loading} />;

    if (query.isError && !query.data) {
      return <p className="comments-state" role="alert">{commentMessages.loadError}</p>;
    }

    return (
      <>
        {query.isError && !query.isFetchNextPageError && (
          <p className="comments-state" role="alert">{commentMessages.loadError}</p>
        )}
        {comments.length ? (
          <ul className="comment-list">
            {comments.map(comment => <CommentItem key={comment.id} comment={comment} />)}
          </ul>
        ) : <p className="comments-state">{commentMessages.empty}</p>}
        <AutomaticPagination
          fallbackClassName="load-more-posts"
          fallbackLabel={commentMessages.loadMore}
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          loadingLabel={commentMessages.loadingMore}
          isNextPageError={query.isFetchNextPageError}
          onLoadNextPage={query.fetchNextPage}
          retryLabel={buttonLabels.retryLoading}
        />
      </>
    );
  };

  return (
    <section className="post-comments" aria-labelledby={headingId}>
      <h2 id={headingId}>{commentMessages.heading}</h2>
      {renderComments()}
    </section>
  );
};

export default PostComments;
