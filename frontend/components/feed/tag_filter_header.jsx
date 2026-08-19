import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { tagFilterMessages } from '../../config/tags';

const TagFilterHeader = ({ clearDestination, tag }) => {
  const headingRef = useRef(null);
  const previousTag = useRef(undefined);

  useEffect(() => {
    const filterChanged = previousTag.current !== tag;
    const shouldAnnounce = Boolean(tag) || Boolean(previousTag.current);

    if (filterChanged && shouldAnnounce) {
      headingRef.current?.focus();
      headingRef.current?.scrollIntoView?.({ block: 'start' });
    }

    previousTag.current = tag;
  }, [tag]);

  return (
    <header className="feed-filter-header">
      <h2
        className={!tag ? 'visually-hidden' : undefined}
        ref={headingRef}
        tabIndex="-1"
      >
        {tagFilterMessages.heading(tag)}
      </h2>
      {tag && (
        <Link
          aria-label={tagFilterMessages.clearLabel}
          className="clear-tag-filter"
          title={tagFilterMessages.clearLabel}
          to={clearDestination}
        >
          <span aria-hidden="true">×</span> {tagFilterMessages.clear}
        </Link>
      )}
    </header>
  );
};

export default TagFilterHeader;
