import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        try {
          const res = await fetch(queryKey[0] as string, {
            credentials: "include",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
            }
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
      refetchOnWindowFocus: false,
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: false,
      onError: (error: Error) => {
        console.error('Mutation error:', error);
      }
    }
  },
});

// Export helper for making API requests
export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  headers: HeadersInit = {}
) {
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  return response;
}