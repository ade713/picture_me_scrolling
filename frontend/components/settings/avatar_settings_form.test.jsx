import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useUpdateAvatar } from '../../query/account_hooks';
import AvatarSettingsForm from './avatar_settings_form';

vi.mock('../../query/account_hooks', () => ({
  useUpdateAvatar: vi.fn()
}));

describe('AvatarSettingsForm', () => {
  let updateAvatar;

  beforeEach(() => {
    updateAvatar = {
      error: null,
      isPending: false,
      mutate: vi.fn(),
      reset: vi.fn()
    };
    useUpdateAvatar.mockReturnValue(updateAvatar);
    URL.createObjectURL = vi.fn(file => `blob:${file.name}`);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderForm = () => render(
    <AvatarSettingsForm
      username="Athos"
    />
  );

  const loadPreview = (image, width, height) => {
    Object.defineProperty(image, 'naturalWidth', { configurable: true, value: width });
    Object.defineProperty(image, 'naturalHeight', { configurable: true, value: height });
    fireEvent.load(image);
  };

  it('waits to show a preview until a file is selected', () => {
    renderForm();

    expect(screen.queryByAltText('Athos avatar preview')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update avatar' })).toBeDisabled();
  });

  it('previews and submits a selected square image', async () => {
    const user = userEvent.setup();
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    renderForm();

    await user.upload(screen.getByLabelText('Choose a new avatar'), file);

    const preview = screen.getByAltText('Athos avatar preview');
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(preview).toHaveAttribute('src', 'blob:avatar.png');
    expect(screen.getByRole('button', { name: 'Update avatar' })).toBeDisabled();

    loadPreview(preview, 200, 200);
    await user.click(screen.getByRole('button', { name: 'Update avatar' }));

    expect(updateAvatar.mutate).toHaveBeenCalledWith(file, {
      onSuccess: expect.any(Function)
    });
  });

  it('cleans up the temporary preview and announces a successful update', async () => {
    const user = userEvent.setup();
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    updateAvatar.mutate.mockImplementation((_file, options) => options.onSuccess());
    renderForm();

    const input = screen.getByLabelText('Choose a new avatar');
    await user.upload(input, file);
    const preview = screen.getByAltText('Athos avatar preview');
    loadPreview(preview, 200, 200);
    await user.click(screen.getByRole('button', { name: 'Update avatar' }));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:avatar.png');
    expect(input).toHaveValue('');
    expect(screen.queryByAltText('Athos avatar preview')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Avatar updated successfully');
  });

  it('blocks a known non-square image before submission', async () => {
    const user = userEvent.setup();
    const file = new File(['avatar'], 'wide.png', { type: 'image/png' });
    renderForm();

    await user.upload(screen.getByLabelText('Choose a new avatar'), file);
    loadPreview(screen.getByAltText('Athos avatar preview'), 300, 200);

    expect(screen.getByRole('alert')).toHaveTextContent('Avatar must be a square image');
    expect(screen.getByRole('button', { name: 'Update avatar' })).toBeDisabled();
    expect(updateAvatar.mutate).not.toHaveBeenCalled();
  });

  it('revokes preview URLs when a file is replaced or cleared', async () => {
    const user = userEvent.setup();
    const input = renderForm().getByLabelText('Choose a new avatar');
    const firstFile = new File(['first'], 'first.png', { type: 'image/png' });
    const secondFile = new File(['second'], 'second.png', { type: 'image/png' });

    await user.upload(input, firstFile);
    await user.upload(input, secondFile);

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:first.png');

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:second.png');
    expect(screen.queryByAltText('Athos avatar preview')).not.toBeInTheDocument();
  });

  it('revokes the current preview URL when unmounted', async () => {
    const user = userEvent.setup();
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const view = renderForm();

    await user.upload(screen.getByLabelText('Choose a new avatar'), file);
    view.unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:avatar.png');
  });

  it('renders backend errors and disables submission while pending', () => {
    updateAvatar.error = { errors: ['Avatar must be 5 MB or smaller'] };
    updateAvatar.isPending = true;

    renderForm();

    expect(screen.getByRole('alert')).toHaveTextContent('Avatar must be 5 MB or smaller');
    expect(screen.getByLabelText('Choose a new avatar')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Updating avatar…' })).toBeDisabled();
  });
});
