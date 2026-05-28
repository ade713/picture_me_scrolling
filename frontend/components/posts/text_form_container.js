import React from 'react';

import { useCreatePost } from '../../query/post_hooks';
import { usePostFormProps } from './post_form_hooks';
import TextForm from './text_form';

const TextFormContainer = props => {
  const createPost = useCreatePost();
  const formProps = usePostFormProps(createPost);

  return <TextForm {...props} {...formProps} />;
};

export default TextFormContainer;
