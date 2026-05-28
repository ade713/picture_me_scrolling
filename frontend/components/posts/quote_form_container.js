import React from 'react';

import { useCreatePost } from '../../query/post_hooks';
import { usePostFormProps } from './post_form_hooks';
import QuoteForm from './quote_form';

const QuoteFormContainer = props => {
  const createPost = useCreatePost();
  const formProps = usePostFormProps(createPost);

  return <QuoteForm {...props} {...formProps} />;
};

export default QuoteFormContainer;
