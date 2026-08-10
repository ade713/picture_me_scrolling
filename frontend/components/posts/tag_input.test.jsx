import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  TAG_COUNT_ERROR,
  TAG_DUPLICATE_ERROR,
  TAG_FORMAT_ERROR,
  TAG_LENGTH_ERROR
} from '../../config/tags';
import TagInput from './tag_input';
import useTagInput from './use_tag_input';

const TagInputHarness = ({ disabled = false, initialTags = [] }) => {
  const tagInput = useTagInput(initialTags);
  const [submittedTags, setSubmittedTags] = useState(null);

  const handleSubmit = event => {
    event.preventDefault();
    const committedTags = tagInput.commitDraft();

    if (committedTags) setSubmittedTags(committedTags);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TagInput disabled={disabled} {...tagInput.inputProps} />
      <button type="submit">Submit post</button>
      {submittedTags && <output>{submittedTags.join(',')}</output>}
    </form>
  );
};

describe('TagInput', () => {
  it('labels the input and describes the tag limit', () => {
    render(<TagInputHarness />);

    const input = screen.getByRole('textbox', { name: 'Tags' });

    expect(input).toHaveAccessibleDescription('0 of 5 tags');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('normalizes and commits a draft with Enter', async () => {
    const user = userEvent.setup();
    render(<TagInputHarness />);

    const input = screen.getByRole('textbox', { name: 'Tags' });
    await user.type(input, ' Photography ');
    await user.keyboard('{Enter}');

    expect(screen.getByText('#photography')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(input).toHaveAccessibleDescription('1 of 5 tags');
  });

  it('commits drafts with a comma or when focus leaves the input', async () => {
    const user = userEvent.setup();
    render(<TagInputHarness />);

    const input = screen.getByRole('textbox', { name: 'Tags' });
    await user.type(input, 'sunset,');
    expect(screen.getByText('#sunset')).toBeInTheDocument();

    await user.type(input, 'travel');
    await user.tab();

    expect(screen.getByText('#travel')).toBeInTheDocument();
  });

  it('commits a valid draft when the post form is submitted', async () => {
    const user = userEvent.setup();
    render(<TagInputHarness />);

    await user.type(screen.getByRole('textbox', { name: 'Tags' }), 'cityscape');
    await user.click(screen.getByRole('button', { name: 'Submit post' }));

    expect(screen.getByText('cityscape')).toBeInTheDocument();
    expect(screen.getByText('#cityscape')).toBeInTheDocument();
  });

  it('shows immediate format and length feedback', async () => {
    const user = userEvent.setup();
    render(<TagInputHarness />);

    const input = screen.getByRole('textbox', { name: 'Tags' });
    await user.type(input, 'invalid-tag');

    expect(screen.getByRole('alert')).toHaveTextContent(TAG_FORMAT_ERROR);
    expect(input).toHaveAttribute('aria-invalid', 'true');

    await user.clear(input);
    await user.type(input, 'a'.repeat(31));

    expect(screen.getByRole('alert')).toHaveTextContent(TAG_LENGTH_ERROR);
  });

  it('rejects duplicate normalized tags', async () => {
    const user = userEvent.setup();
    render(
      <TagInputHarness
        initialTags={['photography', 'sunset', 'travel', 'cityscape', 'film']}
      />
    );

    const input = screen.getByRole('textbox', { name: 'Tags' });
    await user.type(input, ' Photography ');

    expect(screen.getByRole('alert')).toHaveTextContent(TAG_DUPLICATE_ERROR);
    await user.keyboard('{Enter}');
    expect(screen.getAllByText('#photography')).toHaveLength(1);
  });

  it('rejects tags after the maximum count is reached', async () => {
    const user = userEvent.setup();
    render(<TagInputHarness initialTags={['one', 'two', 'three', 'four', 'five']} />);

    const input = screen.getByRole('textbox', { name: 'Tags' });
    await user.type(input, 'six');

    expect(screen.getByRole('alert')).toHaveTextContent(TAG_COUNT_ERROR);
    await user.keyboard('{Enter}');
    expect(screen.queryByText('#six')).not.toBeInTheDocument();
  });

  it('provides accessible controls for removing tags', async () => {
    const user = userEvent.setup();
    render(<TagInputHarness initialTags={['photography']} />);

    await user.click(screen.getByRole('button', { name: 'Remove photography tag' }));

    expect(screen.queryByText('#photography')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Tags' }))
      .toHaveAccessibleDescription('0 of 5 tags');
  });

  it('disables the input and remove controls while pending', () => {
    render(<TagInputHarness disabled initialTags={['photography']} />);

    expect(screen.getByRole('textbox', { name: 'Tags' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove photography tag' })).toBeDisabled();
  });
});
