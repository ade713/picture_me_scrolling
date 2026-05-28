import React from 'react';

import { useCreateMediaPost } from '../../query/post_hooks';
import { usePostFormProps } from './post_form_hooks';
import AudioForm from './audio_form';

const AudioFormContainer = props => {
  const createMediaPost = useCreateMediaPost();
  const formProps = usePostFormProps(createMediaPost);

  return <AudioForm {...props} {...formProps} />;
};

export default AudioFormContainer;
