import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCreateComment } from '../../query/comment_hooks';
import CommentForm from './comment_form';

vi.mock('../../query/comment_hooks', () => ({ useCreateComment: vi.fn() }));

describe('CommentForm', () => {
  let mutation;
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    });
    mutation = { mutate: vi.fn(), reset: vi.fn() };
    useCreateComment.mockImplementation(() => mutation);
  });
  afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it('reserves the composer height and disconnects observation on unmount', () => {
    let resize;
    const disconnect = vi.fn();
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback) { resize = callback; }
      observe() {}
      disconnect = disconnect;
    });
    const bounds = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');
    bounds.mockReturnValue({ height: 180 });
    const view = render(<CommentForm postId={42} onCreated={vi.fn()} />);
    expect(view.container.firstChild).toHaveStyle({ height: '180px' });
    bounds.mockReturnValue({ height: 240 });
    act(() => resize());
    expect(view.container.firstChild).toHaveStyle({ height: '240px' });
    view.unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('requires nonblank text and counts Unicode characters against the limit', () => {
    render(<CommentForm postId={42} onCreated={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: 'Add a comment' });
    expect(input).toHaveAttribute('placeholder', 'Write your comment');
    const submit = screen.getByRole('button', { name: 'Post comment' });
    expect(submit).toBeDisabled();
    fireEvent.change(input, { target: { value: '   ' } });
    expect(submit).toBeDisabled();
    fireEvent.change(input, { target: { value: '😀'.repeat(1000) } });
    expect(screen.getByText('1000 / 1000 characters')).toBeInTheDocument();
    expect(screen.getByText('1000 / 1000 characters')).not.toHaveClass('comment-character-count-over-limit');
    expect(submit).toBeEnabled();
    fireEvent.change(input, { target: { value: 'x'.repeat(1001) } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('1001 / 1000 characters')).toHaveClass('comment-character-count-over-limit');
    expect(submit).toBeDisabled();
    fireEvent.change(input, { target: { value: 'Shortened comment' } });
    expect(screen.getByText('17 / 1000 characters')).not.toHaveClass('comment-character-count-over-limit');
  });

  it('submits the draft and clears it only after successful creation', async () => {
    const onCreated = vi.fn();
    const view = render(<CommentForm postId={42} onCreated={onCreated} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'First line\nSecond line' } });
    await userEvent.setup().click(screen.getByRole('button'));
    expect(useCreateComment).toHaveBeenCalledWith(42);
    expect(mutation.mutate).toHaveBeenCalledWith('First line\nSecond line', expect.any(Object));
    expect(input).toHaveValue('First line\nSecond line');
    const comment = { id: 7, body: 'First line\nSecond line' };
    act(() => mutation.mutate.mock.calls[0][1].onSuccess(comment));
    mutation = { ...mutation, isSuccess: true };
    view.rerender(<CommentForm postId={42} onCreated={onCreated} />);
    expect(onCreated).toHaveBeenCalledWith(comment);
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Comment posted.');
  });

  it('disables editing while pending and retains the draft after failure', () => {
    const view = render(<CommentForm postId={42} onCreated={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Keep this draft' } });
    mutation = { ...mutation, isPending: true };
    view.rerender(<CommentForm postId={42} onCreated={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Posting comment…');
    mutation = { ...mutation, isPending: false, isError: true, error: { errors: ['Unable to save'] } };
    view.rerender(<CommentForm postId={42} onCreated={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('Keep this draft');
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to save');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Edited draft' } });
    expect(mutation.reset).toHaveBeenCalledTimes(1);
  });
});
