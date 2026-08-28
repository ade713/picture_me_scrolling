import React from 'react';
import { render, screen } from '@testing-library/react';

import LoadingIndicator, {
  loadingIndicatorVariants
} from './loading_indicator';

describe('LoadingIndicator', () => {
  it('renders the large variant with decorative dots', () => {
    const { container } = render(
      <LoadingIndicator
        label="Loading posts…"
        variant={loadingIndicatorVariants.large}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading posts…');
    expect(screen.getByText('Loading posts…')).toHaveClass('visually-hidden');
    expect(screen.getByRole('status')).toHaveClass('loading-indicator--large');
    expect(container.querySelector('.loading-dots'))
      .toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('.loading-dot')).toHaveLength(3);
  });
});
