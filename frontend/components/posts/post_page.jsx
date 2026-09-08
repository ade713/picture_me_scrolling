import React, { useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { APP_NAME, BACK_TO_DASHBOARD_LABEL } from '../../config/app';
import { postPageMessages } from '../../config/post_page';
import { routes } from '../../config/routes';
import { usePost } from '../../query/post_hooks';
import { useScrollRestoration } from '../../util/scroll_restoration';
import AccountMenu from '../dashboard/account_menu';
import FeedItem from '../feed/feed_item';
import LoadingIndicator, {
  loadingIndicatorVariants
} from '../loading/loading_indicator';

const HTTP_NOT_FOUND = 404;

const PostPage = () => {
  const { postId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const origin = location.state?.postOrigin;
  const hasFeedOrigin = typeof origin === 'string'
    && /^(\/dashboard|\/users\/\d+)(\?.*)?$/.test(origin);
  const returnDestination = hasFeedOrigin ? origin : routes.dashboard;
  const postQuery = usePost(postId);
  const isNewPosition = useScrollRestoration();

  useLayoutEffect(() => {
    if (isNewPosition) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [postId, isNewPosition]);

  const handleBackClick = event => {
    const isUnmodifiedClick = event.button === 0
      && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

    if (hasFeedOrigin && isUnmodifiedClick) {
      event.preventDefault();
      navigate(-1);
    }
  };

  const renderPostState = () => {
    if (postQuery.isPending) {
      return (
        <LoadingIndicator
          label={postPageMessages.loading}
          variant={loadingIndicatorVariants.large}
        />
      );
    }

    if (postQuery.isError) {
      return (
        <div className="post-page-state" role="alert">
          <h1>
            {postQuery.error?.status === HTTP_NOT_FOUND
              ? postPageMessages.notFound
              : postPageMessages.loadError}
          </h1>
        </div>
      );
    }

    return (
      <section className="post-page-content" aria-labelledby="post-page-heading">
        <h1 className="visually-hidden" id="post-page-heading">
          {postPageMessages.heading}
        </h1>
        <ul className="feed-list">
          <FeedItem
            key={postQuery.data.id}
            post={postQuery.data}
            priorityMedia
            showDetailLink={false}
            onDeleted={() => navigate(returnDestination, { replace: true })}
          />
        </ul>
      </section>
    );
  };

  return (
    <div className="post-page">
      <header className="post-page-nav">
        <Link className="post-page-brand" to={routes.dashboard}>{APP_NAME}</Link>
        <AccountMenu />
      </header>
      <main className="post-page-main">
        <Link
          className="post-page-back-link"
          to={returnDestination}
          onClick={handleBackClick}
        >
          <span aria-hidden="true">←</span>
          {hasFeedOrigin ? postPageMessages.backToFeed : BACK_TO_DASHBOARD_LABEL}
        </Link>
        {renderPostState()}
      </main>
    </div>
  );
};

export default PostPage;
