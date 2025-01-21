import { useState } from 'react';
import ErrorHandler from '@/lib/error-handler';

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
}

export function useApiWithRetry() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApiWithRetry = async <T>(
    apiCall: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T | null> => {
    const { maxRetries = 3, baseDelay = 1000 } = config;
    let retries = 0;

    setIsLoading(true);
    setError(null);

    while (retries < maxRetries) {
      try {
        const result = await apiCall();
        setIsLoading(false);
        return result;
      } catch (err) {
        retries++;
        const error = err instanceof Error ? err : new Error('An unknown error occurred');

        // Log the error with retry context
        await ErrorHandler.logError(error, {
          attempt: retries,
          maxRetries,
          context: 'API Retry'
        });

        if (retries === maxRetries) {
          const errorResult = ErrorHandler.handleAPIError({
            message: error.message,
            canRetry: false
          });

          setError(errorResult.message);
          errorResult.toast();
          setIsLoading(false);
          return null;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, retries - 1)));
      }
    }

    setIsLoading(false);
    return null;
  };

  return {
    callApiWithRetry,
    isLoading,
    error,
  };
}