import { toast } from "@/hooks/use-toast";

const ErrorHandler = {
  logError: async (error: Error, context?: any) => {
    // Log error to console with enhanced details
    console.error({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context: context
    });

    // Show user-friendly toast notification
    toast({
      title: "An error occurred",
      description: error.message,
      variant: "destructive",
    });
  },

  handleValidationError: (error: { message: string; suggestions?: string[] }) => ({
    type: 'ValidationError',
    message: error.message,
    suggestions: error.suggestions || [],
    toast: () => {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }),

  handleAPIError: (error: { message: string; canRetry?: boolean }) => ({
    type: 'APIError',
    message: error.message || 'Service temporarily unavailable',
    retry: error.canRetry ?? false,
    toast: () => {
      toast({
        title: "API Error",
        description: error.message || 'Service temporarily unavailable. Please try again later.',
        variant: "destructive",
      });
    }
  }),

  handleCalculationError: (error: { message: string; details?: Record<string, any> }) => ({
    type: 'CalculationError',
    message: error.message || 'Error in valuation calculations',
    details: error.details || {},
    toast: () => {
      toast({
        title: "Calculation Error",
        description: error.message || 'Error in valuation calculations. Please check your inputs.',
        variant: "destructive",
      });
    }
  })
};

export default ErrorHandler;
