import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import App from './App';
import queryClient from '../query/query_client';

const Root = ({ store }) => (
  <Provider store={ store }>
    <QueryClientProvider client={ queryClient }>
      <App />
    </QueryClientProvider>
  </Provider>
);

export default Root;
