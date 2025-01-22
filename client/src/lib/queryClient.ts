import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        try {
          const res = await fetch(queryKey[0] as string, {
            credentials: "include",
          });

          if (!res.ok) {
            if (res.status === 401) {
              throw new Error("Please log in to continue");
            }

            if (res.status === 404) {
              throw new Error("The requested resource was not found");
            }

            if (res.status >= 500) {
              throw new Error("Server error. Please try again later");
            }

            const errorText = await res.text();
            throw new Error(errorText || `Error ${res.status}: ${res.statusText}`);
          }

          return res.json();
        } catch (error) {
          if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error("Network error. Please check your connection");
          }
          throw error;
        }
      },
      retry: (failureCount, error) => {
        // Don't retry on 401/404 errors
        if (error instanceof Error) {
          if (error.message === "Please log in to continue" || 
              error.message === "The requested resource was not found") {
            return false;
          }
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      // Reduce stale time to ensure fresh data
      staleTime: 30000, // 30 seconds
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          return failureCount < 2;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    }
  },
});