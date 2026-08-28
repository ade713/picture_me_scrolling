import React, { useEffect, useRef } from 'react';

import LoadingIndicator from '../loading/loading_indicator';

const VIEWPORT_PRELOAD_RATIO = 0.1;

const observerSupported = () => (
  typeof globalThis.IntersectionObserver === 'function'
);

const preloadMargin = () => (
  `${Math.round(window.innerHeight * VIEWPORT_PRELOAD_RATIO)}px`
);

const AutomaticPagination = ({
  fallbackClassName,
  fallbackLabel,
  hasNextPage,
  isFetchingNextPage,
  loadingLabel,
  isNextPageError,
  onLoadNextPage,
  retryLabel
}) => {
  const loadRequestedRef = useRef(false);
  const sentinelRef = useRef(null);
  const supportsObserver = observerSupported();

  useEffect(() => {
    if (
      !supportsObserver ||
      !hasNextPage ||
      isFetchingNextPage ||
      isNextPageError
    ) return undefined;

    loadRequestedRef.current = false;
    const observer = new IntersectionObserver(entries => {
      if (
        loadRequestedRef.current ||
        !entries.some(entry => entry.isIntersecting)
      ) return;

      loadRequestedRef.current = true;
      observer.disconnect();
      onLoadNextPage();
    }, {
      rootMargin: `0px 0px ${preloadMargin()} 0px`,
      threshold: 0
    });

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [
    hasNextPage,
    isFetchingNextPage,
    isNextPageError,
    onLoadNextPage,
    supportsObserver
  ]);

  if (!hasNextPage) return null;

  if (isNextPageError) {
    return (
      <button
        className={fallbackClassName}
        onClick={onLoadNextPage}
        type="button"
      >
        {retryLabel}
      </button>
    );
  }

  if (!supportsObserver) {
    return (
      <button
        className={fallbackClassName}
        disabled={isFetchingNextPage}
        onClick={onLoadNextPage}
        type="button"
      >
        {isFetchingNextPage ? loadingLabel : fallbackLabel}
      </button>
    );
  }

  return (
    <div className="automatic-pagination">
      <span
        aria-hidden="true"
        className="automatic-pagination-sentinel"
        ref={sentinelRef}
      ></span>
      {isFetchingNextPage && (
        <LoadingIndicator label={loadingLabel} />
      )}
    </div>
  );
};

export default AutomaticPagination;
