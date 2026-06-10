import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormErrors, ModalButtonFooter } from './post_form_controls';

describe('FormErrors', () => {
  it('renders each form error', () => {
    render(<FormErrors errors={['Title cannot be blank', 'Body cannot be blank']} />);

    expect(screen.getByText('Title cannot be blank')).toBeInTheDocument();
    expect(screen.getByText('Body cannot be blank')).toBeInTheDocument();
  });
});

describe('ModalButtonFooter', () => {
  it('calls close and submit handlers', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(<ModalButtonFooter onClose={onClose} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Post' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables submit when the form is incomplete', () => {
    render(
      <ModalButtonFooter
        disabled
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
  });
});
