import { useMutation } from '@tanstack/react-query';

import { apiEndpoints } from '../config/api_endpoints';
import { post } from '../util/api_client';

export const useRequestPasswordReset = () => (
  useMutation({
    mutationFn: email => post(apiEndpoints.passwordReset, {
      password_reset: { email }
    })
  })
);
