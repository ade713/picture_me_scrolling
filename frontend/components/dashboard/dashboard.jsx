import React, { useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { APP_NAME } from '../../config/app';
import { normalizeTag } from '../../config/tags';
import { useScrollRestoration } from '../../util/scroll_restoration';
import Feed from '../feed/feed';
import RecommendedUsers from '../users/recommended_users';
import AccountMenu from './account_menu';

const Dashboard = () => {
  const feedScrollContainer = useRef(null);
  const mainScrollContainer = useRef(null);
  const [searchParams] = useSearchParams();
  const tagParam = searchParams.get('tag');
  const activeTag = tagParam ? normalizeTag(tagParam) : undefined;
  const getScrollPosition = useCallback(() => ({
    feed: feedScrollContainer.current?.scrollTop || 0,
    main: mainScrollContainer.current?.scrollTop || 0
  }), []);
  const restoreScrollPosition = useCallback(position => {
    if (feedScrollContainer.current) {
      feedScrollContainer.current.scrollTop = position.feed;
    }
    if (mainScrollContainer.current) {
      mainScrollContainer.current.scrollTop = position.main;
    }
  }, []);
  const shouldFocusFeedHeading = useScrollRestoration({
    getScrollPosition,
    restoreScrollPosition
  });

  return (
    <div className="dash-page">
      <header className="dash-nav">
        <h1 className="dash-title">
          {APP_NAME}
        </h1>
        <AccountMenu />
      </header>
      <div className="dash-main" ref={mainScrollContainer}>
        <div className="dash-feed" ref={feedScrollContainer}>
          <Feed
            shouldFocusHeading={shouldFocusFeedHeading}
            tag={activeTag}
          />
        </div>
        <div className="dash-right-column">
          <RecommendedUsers />
          <footer className="dash-right-footer">
            <a
              aria-label="GitHub profile"
              href="https://github.com/ade713"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub profile">
              <i
                className="fa fa-github"
                aria-hidden="true"></i>
            </a>
            <a
              aria-label="LinkedIn profile"
              href="https://www.linkedin.com/in/ade-farquhar"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn profile">
              <i
                className="fa fa-linkedin-square"
                aria-hidden="true"></i>
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
