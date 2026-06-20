import { QueryClient } from '@tanstack/react-query';

const DEFAULT_STALE_TIME = 30 * 1000;
const DEFAULT_GC_TIME = 10 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME
    }
  }
});

export default queryClient;
