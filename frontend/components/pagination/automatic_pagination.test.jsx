import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AutomaticPagination from './automatic_pagination';
import PaginationLoadingIndicator, {
  loadingIndicatorVariants
} from './pagination_loading_indicator';

const buildProps = (overrides = {}) => ({
  fallbackClassName: 'load-more-posts',
  fallbackLabel: 'Load more posts',
  hasNextPage: true,
  isFetchingNextPage: false,
  loadingLabel: 'Loading more posts…',
  isNextPageError: false,
  onLoadNextPage: vi.fn(),
  retryLabel: 'Retry loading',
  ...overrides
});

describe('AutomaticPagination', () => {
  let intersectionCallback;
  let observer;
  let observerConstructor;
  let props;

  beforeEach(() => {
    props = buildProps();
    observer = {
      disconnect: vi.fn(),
      observe: vi.fn()
    };
    observerConstructor = vi.fn();
    globalThis.IntersectionObserver = class {
      constructor(callback, options) {
        intersectionCallback = callback;
        observer.options = options;
        observerConstructor();
      }

      disconnect() {
        observer.disconnect();
      }

      observe(target) {
        observer.observe(target);
      }
    };
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.IntersectionObserver;
  });

  it('observes the sentinel using a ten-percent viewport preload margin', () => {
    const { container } = render(<AutomaticPagination {...props} />);
    const sentinel = container.querySelector('.automatic-pagination-sentinel');

    expect(observer.observe).toHaveBeenCalledWith(sentinel);
    expect(observer.options).toEqual({
      rootMargin: '0px 0px 100px 0px',
      threshold: 0
    });
  });

  it('disconnects and loads one page when the sentinel intersects', () => {
    render(<AutomaticPagination {...props} />);

    act(() => intersectionCallback([{ isIntersecting: true }]));
    act(() => intersectionCallback([{ isIntersecting: true }]));

    expect(observer.disconnect).toHaveBeenCalled();
    expect(props.onLoadNextPage).toHaveBeenCalledTimes(1);
  });

  it('does not load when the sentinel has not intersected', () => {
    render(<AutomaticPagination {...props} />);

    act(() => intersectionCallback([{ isIntersecting: false }]));

    expect(props.onLoadNextPage).not.toHaveBeenCalled();
  });

  it('observes again after a next-page request finishes', () => {
    const { rerender } = render(<AutomaticPagination {...props} />);

    act(() => intersectionCallback([{ isIntersecting: true }]));
    rerender(<AutomaticPagination {...props} isFetchingNextPage />);
    rerender(<AutomaticPagination {...props} />);

    expect(observerConstructor).toHaveBeenCalledTimes(2);
    expect(observer.observe).toHaveBeenCalledTimes(2);
  });

  it('does not observe while a next-page request is pending', () => {
    render(
      <AutomaticPagination {...props} isFetchingNextPage />
    );

    expect(observerConstructor).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Loading more posts…');
  });

  it('disconnects observation and retries after a next-page error', async () => {
    const browserUser = userEvent.setup();
    const { rerender } = render(<AutomaticPagination {...props} />);

    rerender(<AutomaticPagination {...props} isNextPageError />);

    expect(observer.disconnect).toHaveBeenCalled();
    expect(observerConstructor).toHaveBeenCalledTimes(1);

    await browserUser.click(screen.getByRole('button', {
      name: 'Retry loading'
    }));

    expect(props.onLoadNextPage).toHaveBeenCalledTimes(1);
  });

  it('resumes observation after a successful retry', () => {
    const { rerender } = render(
      <AutomaticPagination {...props} isNextPageError />
    );

    rerender(<AutomaticPagination {...props} isFetchingNextPage />);
    rerender(<AutomaticPagination {...props} />);

    expect(observerConstructor).toHaveBeenCalledTimes(1);
    expect(observer.observe).toHaveBeenCalledTimes(1);
  });

  it('disconnects the observer during cleanup', () => {
    const { unmount } = render(<AutomaticPagination {...props} />);

    unmount();

    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('renders nothing after the final page', () => {
    const { container } = render(
      <AutomaticPagination {...props} hasNextPage={false} />
    );

    expect(container).toBeEmptyDOMElement();
    expect(observerConstructor).not.toHaveBeenCalled();
  });

  it('falls back to an accessible load-more button without observer support', async () => {
    const browserUser = userEvent.setup();
    delete globalThis.IntersectionObserver;

    render(<AutomaticPagination {...props} />);
    const fallback = screen.getByRole('button', { name: 'Load more posts' });

    expect(fallback).toHaveClass('load-more-posts');
    await browserUser.click(fallback);
    expect(props.onLoadNextPage).toHaveBeenCalledTimes(1);
  });

  it('disables the fallback action while loading', () => {
    delete globalThis.IntersectionObserver;

    render(<AutomaticPagination {...props} isFetchingNextPage />);

    expect(screen.getByRole('button', { name: 'Loading more posts…' }))
      .toBeDisabled();
  });
});

describe('PaginationLoadingIndicator', () => {
  it('renders the initial variant with decorative dots', () => {
    const { container } = render(
      <PaginationLoadingIndicator
        label="Loading posts…"
        variant={loadingIndicatorVariants.initial}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading posts…');
    expect(screen.getByText('Loading posts…')).toHaveClass('visually-hidden');
    expect(screen.getByRole('status')).toHaveClass(
      'pagination-loading-indicator--initial'
    );
    expect(container.querySelector('.pagination-loading-dots'))
      .toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.pagination-loading-dot')).toHaveLength(3);
  });
});
