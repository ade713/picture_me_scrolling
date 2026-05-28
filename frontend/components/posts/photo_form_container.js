import React from 'react';

import { useCreateMediaPost } from '../../query/post_hooks';
import { usePostFormProps } from './post_form_hooks';
import PhotoForm from './photo_form';

const PhotoFormContainer = props => {
  const createMediaPost = useCreateMediaPost();
  const formProps = usePostFormProps(createMediaPost);

  return <PhotoForm {...props} {...formProps} />;
};

export default PhotoFormContainer;
