import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentBody from './comment_body';

describe('CommentBody', () => {
  it('links explicit HTTP(S) URLs while preserving all original text', () => {
    const body = 'Read https://example.com/path?q=hello&n=2#section\nThen HTTP://example.org.';
    const { container } = render(<CommentBody body={body} />);
    expect(container.textContent).toBe(body);
    const links = screen.getAllByRole('link');
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      'https://example.com/path?q=hello&n=2#section', 'HTTP://example.org'
    ]);
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer ugc');
    }
  });

  it.each([
    ['(https://example.com).', 'https://example.com'],
    ['https://example.com/wiki/Test_(example).', 'https://example.com/wiki/Test_(example)'],
    ['[https://example.com/path],', 'https://example.com/path'],
    ['https://example.com/path?!', 'https://example.com/path'],
    ['"https://example.com"', 'https://example.com']
  ])('keeps punctuation outside the link in %s', (body, href) => {
    const { container } = render(<CommentBody body={body} />);
    expect(container.textContent).toBe(body);
    expect(screen.getByRole('link')).toHaveAttribute('href', href);
  });

  it('leaves unsafe schemes, bare domains, malformed URLs and markup as text', () => {
    const body = '<script>alert(1)</script> javascript:alert(1) javascript:https://example.com data:text/html,test ftp://example.com www.example.com name@example.com https:// https://[bad';
    const { container } = render(<CommentBody body={body} />);
    expect(container.textContent).toBe(body);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
  });

  it('escapes HTML around URLs rather than rendering user markup', () => {
    const body = '<a href="https://example.com">Hello</a>';
    const { container } = render(<CommentBody body={body} />);
    expect(container.textContent).toBe(body);
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link')).toHaveTextContent('https://example.com');
  });

  it('supports keyboard focus and activation without changing the destination', async () => {
    render(<CommentBody body="Visit https://example.com" />);
    const link = screen.getByRole('link');
    const activate = vi.fn(event => event.preventDefault());
    link.addEventListener('click', activate);
    const user = userEvent.setup();
    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(activate).toHaveBeenCalledTimes(1);
    expect(link).toHaveAttribute('href', 'https://example.com');
  });
});
