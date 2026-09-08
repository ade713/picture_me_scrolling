import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { APP_NAME, BACK_TO_DASHBOARD_LABEL } from '../../config/app';
import { postPageMessages } from '../../config/post_page';
import { routes } from '../../config/routes';
import { usePost } from '../../query/post_hooks';
import AccountMenu from '../dashboard/account_menu';
import FeedItem from '../feed/feed_item';
import LoadingIndicator, {
  loadingIndicatorVariants
} from '../loading/loading_indicator';

const HTTP_NOT_FOUND = 404;

const PostPage = () => {
  const { postId } = useParams();
  const postQuery = usePost(postId);

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
          <FeedItem key={postQuery.data.id} post={postQuery.data} priorityMedia />
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
        <Link className="post-page-back-link" to={routes.dashboard}>
          <span aria-hidden="true">←</span>
          {BACK_TO_DASHBOARD_LABEL}
        </Link>
        {renderPostState()}
      </main>
    </div>
  );
};

export default PostPage;
