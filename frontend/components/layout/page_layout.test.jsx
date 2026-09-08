import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import PageLayout from './page_layout';

vi.mock('../dashboard/account_menu', () => ({
  default: () => <button>Account menu</button>
}));

describe('PageLayout', () => {
  it('provides shared navigation and renders page content', () => {
    render(
      <MemoryRouter>
        <PageLayout><h1>Page content</h1></PageLayout>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'PicMeS' }))
      .toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Back to dashboard' }))
      .toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Page content' })
    );
  });

  it('delegates custom back navigation to its page', async () => {
    const user = userEvent.setup();
    const onBackClick = vi.fn(event => event.preventDefault());
    render(
      <MemoryRouter>
        <PageLayout
          className="post-page"
          backDestination="/users/2?tag=sunset"
          backLabel="Back to feed"
          onBackClick={onBackClick}
        >
          <h1>Post</h1>
        </PageLayout>
      </MemoryRouter>
    );

    const backLink = screen.getByRole('link', { name: 'Back to feed' });
    expect(backLink).toHaveAttribute('href', '/users/2?tag=sunset');
    await user.click(backLink);
    expect(onBackClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('main').parentElement).toHaveClass('page-layout', 'post-page');
  });
});
