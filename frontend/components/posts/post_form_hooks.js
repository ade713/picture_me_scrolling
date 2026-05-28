import { useDispatch, useSelector } from 'react-redux';

import { clearErrors, receiveErrors } from '../../actions/errors_actions';
import { receivePost } from '../../actions/posts_actions';

export const usePostFormProps = mutation => {
  const dispatch = useDispatch();
  const currentUser = useSelector(({ session }) => session.currentUser);
  const errors = mutation.error ? mutation.error.errors || [mutation.error.message] : [];

  const clearFormErrors = () => {
    mutation.reset();
    dispatch(clearErrors());
  };

  const submitPost = post => (
    mutation.mutateAsync(post)
      .then(newPost => {
        dispatch(receivePost(newPost));
        dispatch(clearErrors());
        return newPost;
      })
      .catch(error => {
        dispatch(receiveErrors(error.errors || [error.message]));
        throw error;
      })
  );

  return {
    clearErrors: clearFormErrors,
    createPost: submitPost,
    createMediaPost: submitPost,
    currentUser,
    errors
  };
};
