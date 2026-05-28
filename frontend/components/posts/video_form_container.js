import React from 'react';

import { useCreateMediaPost } from '../../query/post_hooks';
import { usePostFormProps } from './post_form_hooks';
import VideoForm from './video_form';

const VideoFormContainer = props => {
  const createMediaPost = useCreateMediaPost();
  const formProps = usePostFormProps(createMediaPost);

  return <VideoForm {...props} {...formProps} />;
};

export default VideoFormContainer;
