import React, { useEffect, useId, useLayoutEffect, useRef } from "react";
import { buttonLabels } from "../../config/button_labels";
import { commentMessages } from "../../config/comments";
import { useCommentReplies } from "../../query/reply_hooks";
import LoadingIndicator from "../loading/loading_indicator";
import CommentItem from "./comment_item";

const ReplyList = ({ postId, commentId, submittedReplies, onLoaded, onUpdated, onDeleted }) => {
  const query = useCommentReplies(postId, commentId);
  const list = useRef(null);
  const scrollAnchor = useRef(null);
  const loadButton = useRef(null);
  const submittedId = useId();
  const visibleSubmissions = submittedReplies.filter(
    (reply) => !query.data?.replies.some((loaded) => loaded.id === reply.id),
  );

  useEffect(() => {
    if (query.data?.replies) onLoaded(query.data.replies);
  }, [query.data?.replies, onLoaded, submittedReplies]);

  useEffect(() => {
    const trackPosition = () => {
      const anchor = scrollAnchor.current;
      if (anchor?.element.isConnected) {
        anchor.top = anchor.element.getBoundingClientRect().top;
      }
    };
    window.addEventListener("scroll", trackPosition, { passive: true });
    return () => window.removeEventListener("scroll", trackPosition);
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
        element.querySelector("a")?.focus({ preventScroll: true });
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
        restoreFocus: document.activeElement === loadButton.current,
      };
    }
    query.fetchNextPage();
  };

  const renderReply = (reply) => (
    <CommentItem key={reply.id} comment={reply} postId={postId} onUpdated={onUpdated} onDeleted={onDeleted} />
  );

  return (
    <>
      {query.isPending && <LoadingIndicator label={commentMessages.loadingReplies} />}
      {query.isError && <p role='alert'>{commentMessages.repliesError}</p>}
      {query.isError && !query.isFetchNextPageError && (
        <button className='comment-replies-button' type='button' disabled={query.isFetching} onClick={() => query.refetch()}>
          {buttonLabels.retry}
        </button>
      )}
      <ul ref={list} className='comment-reply-list'>
        {query.data?.replies.map(renderReply)}
      </ul>
      {!query.isError && query.data?.replies.length === 0 && !visibleSubmissions.length && (
        <p>{commentMessages.noReplies}</p>
      )}
      {query.hasNextPage && (
        <div className='comment-replies-pagination'>
          {query.isFetchingNextPage && <LoadingIndicator label={commentMessages.loadingReplies} />}
          <button ref={loadButton} className='comment-replies-button' type='button' disabled={query.isFetching} onClick={loadMore}>
            {query.isFetchNextPageError ? buttonLabels.retryLoading : commentMessages.moreReplies}
          </button>
        </div>
      )}
      {visibleSubmissions.length > 0 && (
        <section className='comment-submissions' aria-labelledby={submittedId}>
          <h3 id={submittedId}>{commentMessages.submittedRepliesHeading}</h3>
          <p>{commentMessages.submittedRepliesGuidance}</p>
          <ul>{visibleSubmissions.map(renderReply)}</ul>
        </section>
      )}
    </>
  );
};

export default ReplyList;
