import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { routes } from '../../config/routes';
import { usePost } from '../../query/post_hooks';
import { useCurrentUser } from '../../query/session_hooks';
import { ProtectedRoute } from '../../util/route_util';
import {
  ScrollRestorationProvider, useScrollRestoration
} from '../../util/scroll_restoration';
import PostDetailLink from '../feed/post_detail_link';
import PostPage from './post_page';

vi.mock('../../query/post_hooks', () => ({ usePost: vi.fn() }));
vi.mock('../../query/session_hooks', () => ({ useCurrentUser: vi.fn() }));
vi.mock('../dashboard/account_menu', () => ({
  default: () => <div>Account menu</div>
}));
// Post rendering/actions have their own tests; verify page composition here.
vi.mock('../feed/feed_item', () => ({
  default: ({ post, priorityMedia, onDeleted }) => (
    <li data-testid="post" data-priority-media={priorityMedia}>
      {post.title}
      <button onClick={onDeleted}>Simulate successful deletion</button>
    </li>
  )
}));

const renderPage = () => render(
  <MemoryRouter initialEntries={['/posts/42']}>
    <Routes>
      <Route
        path={routes.post}
        element={
          <ProtectedRoute>
            <PostPage />
          </ProtectedRoute>
        }
      />
      <Route path={routes.dashboard} element={<h1>Dashboard</h1>} />
      <Route path={routes.home} element={<h1>Log in</h1>} />
    </Routes>
  </MemoryRouter>
);

describe('PostPage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    useCurrentUser.mockReturnValue({ data: { id: 1 } });
    usePost.mockReturnValue({
      data: { id: 42, title: 'A single post' },
      isPending: false,
      isError: false
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('loads the route ID and renders one existing post with priority media', () => {
    renderPage();

    expect(usePost).toHaveBeenCalledWith('42');
    expect(screen.getByRole('region', { name: 'Post' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByTestId('post')).toHaveTextContent('A single post');
    expect(screen.getByTestId('post')).toHaveAttribute('data-priority-media', 'true');
    expect(screen.getByRole('link', { name: 'PicMeS' }))
      .toHaveAttribute('href', '/dashboard');
  });

  it('shows only the loading indicator while the post is pending', () => {
    usePost.mockReturnValue({ isPending: true });
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Loading post…');
    expect(screen.getByRole('status')).toHaveClass('loading-indicator--large');
    expect(screen.queryByTestId('post')).not.toBeInTheDocument();
    expect(document.querySelector('.post-page-state')).toBeNull();
  });

  it.each([
    [404, 'Post not found'],
    [500, 'Unable to load post.']
  ])('renders the appropriate state for status %s', (status, message) => {
    usePost.mockReturnValue({
      isError: true,
      error: { status, message: 'Private server details' }
    });
    renderPage();

    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByText('Private server details')).not.toBeInTheDocument();
    expect(screen.queryByTestId('post')).not.toBeInTheDocument();
  });

  it('provides a dashboard destination for direct entry', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('link', { name: 'Back to dashboard' }));

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('redirects signed-out visitors without requesting a post', () => {
    useCurrentUser.mockReturnValue({ data: null });
    renderPage();

    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(usePost).not.toHaveBeenCalled();
  });

  it('returns to the originating filtered profile and restores its position', async () => {
    const user = userEvent.setup();
    let position = 0;
    const scrollY = vi.spyOn(window, 'scrollY', 'get')
      .mockImplementation(() => position);
    const Feed = () => {
      useScrollRestoration({ restoreByRoute: true });
      return <PostDetailLink postId={42}>View post</PostDetailLink>;
    };
    render(
      <MemoryRouter initialEntries={['/users/2?tag=sunset']}>
        <ScrollRestorationProvider>
          <Routes>
            <Route path={routes.profile} element={<Feed />} />
            <Route path={routes.post} element={<PostPage />} />
          </Routes>
        </ScrollRestorationProvider>
      </MemoryRouter>
    );
    position = 640;
    await user.click(screen.getByRole('link', { name: 'View post' }));
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 0, left: 0, behavior: 'auto'
    });
    expect(screen.getByRole('link', { name: 'Back to feed' }))
      .toHaveAttribute('href', '/users/2?tag=sunset');
    await user.click(screen.getByRole('link', { name: 'Back to feed' }));
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 640, left: 0, behavior: 'auto'
    });
    scrollY.mockRestore();
  });

  it.each([
    ['/dashboard?tag=sunset', routes.dashboard],
    ['/users/2?tag=sunset', routes.profile]
  ])('returns to %s after successful deletion', async (origin, route) => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={[origin]}>
        <Routes>
          <Route path={route} element={
            <PostDetailLink postId={42}>View post</PostDetailLink>
          } />
          <Route path={routes.post} element={<PostPage />} />
        </Routes>
      </MemoryRouter>
    );
    await user.click(screen.getByRole('link', { name: 'View post' }));
    await user.click(screen.getByRole('button', { name: 'Simulate successful deletion' }));
    expect(screen.getByRole('link', { name: 'View post' })).toBeInTheDocument();
  });

  it('falls back to the dashboard after direct-entry deletion', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Simulate successful deletion' }));
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});
