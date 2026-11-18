import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import CommentPreview from './comment_preview';

const comments = [1, 2, 3].map(id => ({
  id, body: `Preview ${id}`, author: { id: id + 10, username: `Reader ${id}`, avatar_url: `/avatars/${id}.png` }
}));
const Location = () => {
  const location = useLocation();
  return <output data-testid="location">{JSON.stringify(location)}</output>;
};

describe('CommentPreview', () => {
  it.each(['/dashboard?tag=photo', '/users/7?tag=photo'])(
    'renders read-only previews and preserves navigation from %s', async origin => {
      const user = userEvent.setup();
      render(<MemoryRouter initialEntries={[origin]}>
        <CommentPreview postId={42} comments={comments} /><Location />
      </MemoryRouter>);

      const items = within(screen.getByRole('list', { name: 'Recent comments' })).getAllByRole('listitem');
      expect(items).toHaveLength(comments.length);
      items.forEach((item, index) => {
        expect(within(item).getByRole('link', { name: comments[index].author.username })).toBeInTheDocument();
        expect(within(item).getByText(comments[index].body)).toBeInTheDocument();
      });
      expect(screen.getByRole('link', { name: 'Reader 1' })).toHaveAttribute('href', '/users/11');
      const avatar = within(screen.getByRole('link', { name: 'Reader 1' })).getByAltText('');
      expect(avatar).toHaveAttribute('src', '/avatars/1.png');
      expect(avatar).toHaveAttribute('loading', 'lazy');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Reader 1' })).toHaveFocus();
      await user.tab();
      await user.tab();
      await user.tab();
      expect(screen.getByRole('link', { name: 'View all comments' })).toHaveFocus();
      await user.keyboard('{Enter}');
      const destination = JSON.parse(screen.getByTestId('location').textContent);
      expect(destination.pathname).toBe('/posts/42');
      expect(destination.state.postOrigin).toBe(origin);
    }
  );

  it('offers post navigation when there are no previews, including older cached posts', () => {
    const { rerender } = render(<MemoryRouter><CommentPreview postId={42} /></MemoryRouter>);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add a comment' })).toHaveAttribute('href', '/posts/42');
    rerender(<MemoryRouter><CommentPreview postId={42} comments={[]} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Add a comment' })).toBeInTheDocument();
  });

  it('renders comment markup as plain text', () => {
    render(<MemoryRouter><CommentPreview postId={42} comments={[
      { ...comments[0], body: '<script>alert(1)</script> https://example.com' }
    ]} /></MemoryRouter>);
    expect(screen.getByText('<script>alert(1)</script> https://example.com')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
