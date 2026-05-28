import React from 'react';

import { useCreatePost } from '../../query/post_hooks';
import { usePostFormProps } from './post_form_hooks';
import LinkForm from './link_form';

const LinkFormContainer = props => {
  const createPost = useCreatePost();
  const formProps = usePostFormProps(createPost);

  return <LinkForm {...props} {...formProps} />;
};

export default LinkFormContainer;
