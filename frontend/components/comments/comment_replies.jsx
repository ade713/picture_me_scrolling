import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { buttonLabels } from '../../config/button_labels';
import { commentMessages } from '../../config/comments';
import { useCommentReplies } from '../../query/reply_hooks';
import LoadingIndicator from '../loading/loading_indicator';
import CommentItem from './comment_item';

const ReplyList = ({ postId, commentId }) => {
  const query = useCommentReplies(postId, commentId);
  const list = useRef(null);
  const scrollAnchor = useRef(null);
  const loadButton = useRef(null);

  useEffect(() => {
    const trackPosition = () => {
      const anchor = scrollAnchor.current;
      if (anchor?.element.isConnected) {
        anchor.top = anchor.element.getBoundingClientRect().top;
      }
    };
    window.addEventListener('scroll', trackPosition, { passive: true });
    return () => window.removeEventListener('scroll', trackPosition);
  }, []);

  useLayoutEffect(() => {
    if (!scrollAnchor.current || query.isFetchingNextPage) return;
    const { element, top, pages, restoreFocus } = scrollAnchor.current;
    scrollAnchor.current = null;
    if (query.data?.pages.length > pages && element.isConnected) {
      // Correct only the remaining visual movement. Adding the scroll offset
      // would double-compensate if the browser already anchored the viewport.
      const shift = element.getBoundingClientRect().top - top;
      if (shift) window.scrollBy(0, shift);
      // Only replace focus lost when the load button disappears; don't override
      // another control the reader focused while the request was pending.
      if (!query.hasNextPage && restoreFocus && document.activeElement === document.body) {
        element.querySelector('a')?.focus({ preventScroll: true });
      }
    }
  }, [query.data, query.isFetchingNextPage, query.hasNextPage]);

  const loadMore = () => {
    if (query.isFetching || !query.hasNextPage) return;
    const element = list.current?.lastElementChild;
    if (element) {
      scrollAnchor.current = {
        element,
        top: element.getBoundingClientRect().top,
        pages: query.data.pages.length,
        restoreFocus: document.activeElement === loadButton.current
      };
    }
    query.fetchNextPage();
  };

  if (query.isPending) return <LoadingIndicator label={commentMessages.loadingReplies} />;

  return (
    <>
      {query.isError && <p role="alert">{commentMessages.repliesError}</p>}
      {query.isError && !query.isFetchNextPageError && (
        <button type="button" disabled={query.isFetching} onClick={() => query.refetch()}>
          {buttonLabels.retry}
        </button>
      )}
      <ul ref={list} className="comment-reply-list">
        {query.data?.replies.map(reply => <CommentItem key={reply.id} comment={reply} readOnly />)}
      </ul>
      {!query.isError && query.data?.replies.length === 0 && <p>{commentMessages.noReplies}</p>}
      {query.hasNextPage && (
        <div className="comment-replies-pagination">
          {query.isFetchingNextPage && <LoadingIndicator label={commentMessages.loadingReplies} />}
          <button ref={loadButton} type="button" disabled={query.isFetching} onClick={loadMore}>
            {query.isFetchNextPageError ? buttonLabels.retryLoading : commentMessages.moreReplies}
          </button>
        </div>
      )}
    </>
  );
};

const CommentReplies = ({ postId, commentId }) => {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return (
    <div className="comment-replies">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(value => !value)}>
        {expanded ? commentMessages.hideReplies : commentMessages.viewReplies}
      </button>
      <div id={id}>
        {expanded && <ReplyList postId={postId} commentId={commentId} />}
      </div>
    </div>
  );
};

export default CommentReplies;
