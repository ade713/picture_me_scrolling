import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { commentMessages } from "../../config/comments";
import ReplyForm from "./reply_form";
import ReplyList from "./reply_list";

const CommentReplies = ({ postId, commentId, replyCount = 0, deleted = false, onDeleted }) => {
  const [expanded, setExpanded] = useState(false);
  const [replying, setReplying] = useState(false);
  const [submittedReplies, setSubmittedReplies] = useState([]);
  const [feedback, setFeedback] = useState("");
  const replyButton = useRef(null);
  const toggleButton = useRef(null);
  const id = useId();
  const retireLoadedReplies = useCallback((replies) => {
    setSubmittedReplies((previous) => {
      const remaining = previous.filter((reply) => !replies.some((loaded) => loaded.id === reply.id));
      return remaining.length === previous.length ? previous : remaining;
    });
  }, []);

  const handleDeleted = (replyId) => {
    setSubmittedReplies((previous) => previous.filter((reply) => reply.id !== replyId));
    setFeedback("");
    // Parent refetching may remove the whole thread after its final reply.
    onDeleted?.(replyId);
  };

  const handleUpdated = (updated) => {
    setSubmittedReplies((previous) => previous.map((reply) => (reply.id === updated.id ? updated : reply)));
    setFeedback(commentMessages.saved);
  };

  const openReplyForm = () => {
    setReplying(true);
    setExpanded(true);
  };

  const cancelReply = () => {
    setReplying(false);
    replyButton.current?.focus();
  };

  const handleCreated = (reply) => {
    setSubmittedReplies((previous) => [...previous.filter((item) => item.id !== reply.id), reply]);
    setExpanded(true);
  };

  useEffect(() => {
    if (deleted && replying) {
      setReplying(false);
      toggleButton.current?.focus();
    }
  }, [deleted, replying]);

  return (
    <div className='comment-replies'>
      <p role='status' className='visually-hidden'>
        {feedback}
      </p>
      {!deleted && (
        <button
          ref={replyButton}
          className='comment-replies-button'
          type='button'
          aria-expanded={replying}
          aria-controls={`${id}-form`}
          onClick={openReplyForm}
        >
          {commentMessages.reply}
        </button>
      )}
      {(replyCount > 0 || expanded || submittedReplies.length > 0) && (
        <button
          ref={toggleButton}
          className='comment-replies-button'
          type='button'
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? commentMessages.hideReplies : commentMessages.viewReplies}
        </button>
      )}
      <div id={id}>
        {expanded && (
          <ReplyList
            postId={postId}
            commentId={commentId}
            submittedReplies={submittedReplies}
            onLoaded={retireLoadedReplies}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        )}
      </div>
      <div id={`${id}-form`}>
        {replying && !deleted && (
          <ReplyForm
            postId={postId}
            commentId={commentId}
            onCancel={cancelReply}
            onCreated={handleCreated}
          />
        )}
      </div>
    </div>
  );
};

export default CommentReplies;
