import { useRef, useState } from 'react';

import { useCurrentUser } from '../../query/session_hooks';

export const usePostFormProps = mutation => {
  const currentUser = useCurrentUser();
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mutationIsSubmitting = mutation.isPending || mutation.isLoading;
  const errors = mutation.error ? mutation.error.errors || [mutation.error.message] : [];

  const clearFormErrors = () => {
    mutation.reset();
  };

  const submitPost = post => {
    if (submittingRef.current || mutationIsSubmitting) return Promise.resolve(null);

    submittingRef.current = true;
    setIsSubmitting(true);

    return mutation.mutateAsync(post).finally(() => {
      submittingRef.current = false;
      setIsSubmitting(false);
    });
  };

  return {
    clearErrors: clearFormErrors,
    createPost: submitPost,
    createMediaPost: submitPost,
    currentUser: currentUser.data,
    errors,
    isSubmitting: isSubmitting || mutationIsSubmitting
  };
};
