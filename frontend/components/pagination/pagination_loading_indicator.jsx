import React from 'react';

export const loadingIndicatorVariants = Object.freeze({
  initial: 'initial',
  nextPage: 'next-page'
});

const PaginationLoadingIndicator = ({
  label,
  variant = loadingIndicatorVariants.nextPage
}) => (
  <div
    className={`pagination-loading-indicator pagination-loading-indicator--${variant}`}
    role="status"
  >
    <span className="visually-hidden">{label}</span>
    <span aria-hidden="true" className="pagination-loading-dots">
      <span className="pagination-loading-dot"></span>
      <span className="pagination-loading-dot"></span>
      <span className="pagination-loading-dot"></span>
    </span>
  </div>
);

export default PaginationLoadingIndicator;
