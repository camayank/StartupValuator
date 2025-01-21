import ErrorHandler from './error-handler';

interface ErrorEvent {
  message: string;
  source: string;
  lineno: number;
  colno: number;
  error: Error;
}

interface PromiseRejectionEvent {
  reason: any;
  promise: Promise<any>;
}

export function setupErrorMonitoring() {
  // Handle synchronous errors
  window.onerror = (message: string | Event, source?: string, lineno?: number, colno?: number, error?: Error) => {
    if (error) {
      ErrorHandler.logError(error, { message, source, lineno, colno });
    }
  };

  // Handle unhandled promise rejections
  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    ErrorHandler.logError(error, 'Unhandled Promise Rejection');
  };

  // Add fetch error interceptor
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch.apply(window, args);

      // Don't log 401s for /api/user as that's expected when not logged in
      if (!response.ok && !(response.status === 401 && args[0] === '/api/user')) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        ErrorHandler.logError(error, {
          url: args[0],
          status: response.status,
          statusText: response.statusText
        });
      }
      return response;
    } catch (error) {
      ErrorHandler.logError(error instanceof Error ? error : new Error(String(error)), 'Fetch Error');
      throw error;
    }
  };
}