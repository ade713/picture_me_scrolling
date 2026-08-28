import React from 'react';

export const loadingIndicatorVariants = Object.freeze({
  compact: 'compact',
  large: 'large'
});

const LoadingIndicator = ({
  label,
  variant = loadingIndicatorVariants.compact
}) => (
  <div
    className={`loading-indicator loading-indicator--${variant}`}
    role="status"
  >
    <span className="visually-hidden">{label}</span>
    <span aria-hidden="true" className="loading-dots">
      <span className="loading-dot"></span>
      <span className="loading-dot"></span>
      <span className="loading-dot"></span>
    </span>
  </div>
);

export default LoadingIndicator;
