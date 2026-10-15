import React, { useEffect, useId, useRef, useState } from 'react';

import { buttonLabels } from '../../config/button_labels';
import { commentMessages } from '../../config/comments';
import { usePostComments } from '../../query/comment_hooks';
import LoadingIndicator from '../loading/loading_indicator';
import AutomaticPagination from '../pagination/automatic_pagination';
import CommentItem from './comment_item';
import CommentForm from './comment_form';

const PostComments = ({ postId }) => {
  const headingId = useId();
  const heading = useRef(null);
  const [feedback, setFeedback] = useState('');
  const query = usePostComments(postId);
  const [submittedComments, setSubmittedComments] = useState([]);
  const comments = query.data?.comments || [];
  const visibleSubmissions = submittedComments.filter(submitted => (
    !comments.some(comment => comment.id === submitted.id)
  ));

  // Once a submission reaches the loaded pages, those pages own its state.
  // Retiring the local copy prevents it resurfacing after later deletions.
  useEffect(() => {
    setSubmittedComments(previous => {
      const remaining = previous.filter(submitted => (
        !query.data?.comments.some(comment => comment.id === submitted.id)
      ));
      return remaining.length === previous.length ? previous : remaining;
    });
  }, [query.data?.comments, submittedComments]);

  const handleCreated = comment => {
    setSubmittedComments(previous => [
      ...previous.filter(submitted => submitted.id !== comment.id), comment
    ]);
  };

  const handleUpdated = updated => {
    setSubmittedComments(previous => previous.map(comment => comment.id === updated.id ? updated : comment));
    setFeedback(commentMessages.saved);
  };

  const handleDeleted = id => {
    setSubmittedComments(previous => previous.filter(comment => comment.id !== id));
    setFeedback(commentMessages.removed);
    window.requestAnimationFrame(() => heading.current?.focus());
  };

  const renderComment = comment => (
    <CommentItem key={comment.id} comment={comment} postId={postId}
      onUpdated={handleUpdated} onDeleted={handleDeleted} />
  );

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
            {comments.map(renderComment)}
          </ul>
        ) : !visibleSubmissions.length && <p className="comments-state">{commentMessages.empty}</p>}
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
      <h2 id={headingId} ref={heading} tabIndex={-1}>{commentMessages.heading}</h2>
      <p role="status" className="visually-hidden">{feedback}</p>
      {visibleSubmissions.length > 0 && (
        <section className="comment-submissions" aria-labelledby={`${headingId}-submitted`}>
          <h3 id={`${headingId}-submitted`}>{commentMessages.submittedHeading}</h3>
          <p>{commentMessages.submittedGuidance}</p>
          <ul>
            {visibleSubmissions.map(renderComment)}
          </ul>
        </section>
      )}
      {renderComments()}
      <CommentForm key={postId} postId={postId} onCreated={handleCreated} />
    </section>
  );
};

export default PostComments;
