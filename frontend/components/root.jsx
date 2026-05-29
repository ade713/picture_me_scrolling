import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import queryClient from '../query/query_client';

const Root = () => (
  <QueryClientProvider client={ queryClient }>
    <App />
  </QueryClientProvider>
);

export default Root;
