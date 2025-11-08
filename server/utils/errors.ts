/**
 * Custom error classes for Indian startup valuation platform
 */

export class ValuationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'ValuationError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ValuationError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400, { fields });
    this.name = 'ValidationError';
  }
}

export class InsufficientDataError extends ValuationError {
  constructor(message: string, public requiredData?: string[]) {
    super(message, 'INSUFFICIENT_DATA', 400, { requiredData });
    this.name = 'InsufficientDataError';
  }
}

export class CalculationError extends ValuationError {
  constructor(message: string, public method?: string) {
    super(message, 'CALCULATION_ERROR', 500, { method });
    this.name = 'CalculationError';
  }
}

export class DatabaseError extends ValuationError {
  constructor(message: string, public operation?: string) {
    super(message, 'DATABASE_ERROR', 500, { operation });
    this.name = 'DatabaseError';
  }
}

export class AuthorizationError extends ValuationError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ValuationError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, { resource, id });
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ValuationError {
  constructor(public retryAfter?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Error handler middleware
 */
export function handleError(error: Error): {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
} {
  if (error instanceof ValuationError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // Handle standard errors
  console.error('Unhandled error:', error);

  return {
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
    details: process.env.NODE_ENV === 'development' ? {
      stack: error.stack,
      message: error.message,
    } : undefined,
  };
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error;
    }
  };
}
