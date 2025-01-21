import ErrorHandler from '../error-handler';

// Mock the toast function directly instead of importing from hooks
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  toast: (...args: any[]) => mockToast(...args)
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock console.error to avoid polluting test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logError', () => {
    test('logs error with context to console and shows toast', async () => {
      const error = new Error('Test error');
      const context = { source: 'test' };

      await ErrorHandler.logError(error, context);

      expect(console.error).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
          error: 'Test error',
          context: context,
          stack: expect.any(String)
        })
      );

      expect(mockToast).toHaveBeenCalledWith({
        title: "An error occurred",
        description: "Test error",
        variant: "destructive",
      });
    });

    test('handles errors without context', async () => {
      const error = new Error('Simple error');

      await ErrorHandler.logError(error);

      expect(console.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Simple error'
        })
      );
    });
  });

  describe('handleValidationError', () => {
    test('handles validation errors with suggestions', () => {
      const error = {
        message: 'Invalid input',
        suggestions: ['Check field A', 'Check field B']
      };

      const result = ErrorHandler.handleValidationError(error);

      expect(result).toEqual({
        type: 'ValidationError',
        message: 'Invalid input',
        suggestions: ['Check field A', 'Check field B'],
        toast: expect.any(Function)
      });

      // Test toast function
      result.toast();
      expect(mockToast).toHaveBeenCalledWith({
        title: "Validation Error",
        description: "Invalid input",
        variant: "destructive",
      });
    });

    test('handles validation errors without suggestions', () => {
      const error = { message: 'Invalid input' };

      const result = ErrorHandler.handleValidationError(error);

      expect(result).toEqual({
        type: 'ValidationError',
        message: 'Invalid input',
        suggestions: [],
        toast: expect.any(Function)
      });
    });
  });

  describe('handleAPIError', () => {
    test('handles API errors with custom message and retry option', () => {
      const error = {
        message: 'API Timeout',
        canRetry: true
      };

      const result = ErrorHandler.handleAPIError(error);

      expect(result).toEqual({
        type: 'APIError',
        message: 'API Timeout',
        retry: true,
        toast: expect.any(Function)
      });

      result.toast();
      expect(mockToast).toHaveBeenCalledWith({
        title: "API Error",
        description: "API Timeout",
        variant: "destructive",
      });
    });

    test('handles API errors with default values', () => {
      const error = { message: 'Generic API Error' };

      const result = ErrorHandler.handleAPIError(error);

      expect(result).toEqual({
        type: 'APIError',
        message: 'Generic API Error',
        retry: false,
        toast: expect.any(Function)
      });
    });
  });

  describe('handleCalculationError', () => {
    test('handles calculation errors with details', () => {
      const error = {
        message: 'Calculation failed',
        details: { field: 'revenue', reason: 'negative value' }
      };

      const result = ErrorHandler.handleCalculationError(error);

      expect(result).toEqual({
        type: 'CalculationError',
        message: 'Calculation failed',
        details: { field: 'revenue', reason: 'negative value' },
        toast: expect.any(Function)
      });

      result.toast();
      expect(mockToast).toHaveBeenCalledWith({
        title: "Calculation Error",
        description: "Calculation failed",
        variant: "destructive",
      });
    });

    test('handles calculation errors with default values', () => {
      const error = { message: 'Generic calculation error' };

      const result = ErrorHandler.handleCalculationError(error);

      expect(result).toEqual({
        type: 'CalculationError',
        message: 'Generic calculation error',
        details: {},
        toast: expect.any(Function)
      });
    });

    test('handles calculation errors with edge cases', () => {
      const error = {
        message: 'Complex calculation error',
        details: {
          formula: 'NPV',
          inputs: { rate: 0.1, periods: 5 },
          stage: 'processing'
        }
      };

      const result = ErrorHandler.handleCalculationError(error);

      expect(result).toEqual({
        type: 'CalculationError',
        message: 'Complex calculation error',
        details: {
          formula: 'NPV',
          inputs: { rate: 0.1, periods: 5 },
          stage: 'processing'
        },
        toast: expect.any(Function)
      });
    });
  });
});