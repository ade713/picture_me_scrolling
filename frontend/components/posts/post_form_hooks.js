import { useCurrentUser } from '../../query/session_hooks';

export const usePostFormProps = mutation => {
  const currentUser = useCurrentUser();
  const errors = mutation.error ? mutation.error.errors || [mutation.error.message] : [];

  const clearFormErrors = () => {
    mutation.reset();
  };

  const submitPost = post => mutation.mutateAsync(post);

  return {
    clearErrors: clearFormErrors,
    createPost: submitPost,
    createMediaPost: submitPost,
    currentUser: currentUser.data,
    errors
  };
};
