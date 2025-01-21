import { useToast } from "@/hooks/use-toast";

export interface ErrorMessage {
  type: 'validation' | 'business' | 'system';
  message: string;
  fields?: string[];
  suggestions?: string[];
}

export const ErrorMessaging = {
  validation: {
    incompleteFields: (fields: string[]): ErrorMessage => ({
      type: 'validation',
      message: `Please complete the following fields: ${fields.join(', ')}`,
      fields,
      suggestions: ['Review highlighted fields', 'Check for any missing required information']
    }),

    invalidValue: (field: string, details: string): ErrorMessage => ({
      type: 'validation',
      message: `Invalid value for ${field}: ${details}`,
      fields: [field],
      suggestions: ['Check the input format', 'Review field requirements']
    }),

    dependencyMissing: (field: string, dependencies: string[]): ErrorMessage => ({
      type: 'validation',
      message: `${field} requires ${dependencies.join(', ')} to be filled first`,
      fields: [field, ...dependencies],
      suggestions: ['Complete dependent fields first', 'Follow the form sequence']
    })
  },

  business: {
    inconsistentMetrics: (details: string): ErrorMessage => ({
      type: 'business',
      message: `Business metrics appear inconsistent: ${details}`,
      suggestions: [
        'Review your financial calculations',
        'Check for data entry errors',
        'Verify metric relationships'
      ]
    }),

    marketSizeMismatch: (expected: string, actual: string): ErrorMessage => ({
      type: 'business',
      message: `Market size (${actual}) seems unusual for your industry (typical: ${expected})`,
      suggestions: [
        'Verify market size calculation',
        'Check industry benchmarks',
        'Consider updating your target market'
      ]
    })
  },

  system: {
    networkError: (): ErrorMessage => ({
      type: 'system',
      message: 'Unable to connect to the server. Please check your connection.',
      suggestions: ['Check your internet connection', 'Try refreshing the page', 'Contact support if the issue persists']
    }),

    dataError: (): ErrorMessage => ({
      type: 'system',
      message: 'Error saving your data. Changes may not have been saved.',
      suggestions: ['Try again', 'Check your inputs', 'Contact support if the issue persists']
    })
  },

  display: {
    showError: (error: ErrorMessage): void => {
      const { toast } = useToast();
      
      toast({
        variant: "destructive",
        title: error.message,
        description: error.suggestions ? 
          <ul className="mt-2 list-disc pl-4">
            {error.suggestions.map((suggestion, i) => (
              <li key={i} className="text-sm">{suggestion}</li>
            ))}
          </ul>
          : null
      });
    },

    showFieldErrors: (errors: Map<string, string[]>): void => {
      const fields = Array.from(errors.keys());
      if (fields.length > 0) {
        ErrorMessaging.display.showError(
          ErrorMessaging.validation.incompleteFields(fields)
        );
      }
    }
  },

  handle: (error: unknown): ErrorMessage => {
    if (error instanceof Error) {
      // Handle known error types
      if (error.name === 'ValidationError') {
        return {
          type: 'validation',
          message: error.message,
          suggestions: ['Check your input', 'Review field requirements']
        };
      }
      
      // Handle other known errors...
      
      // Default error handling
      return {
        type: 'system',
        message: error.message || 'An unexpected error occurred',
        suggestions: ['Try again', 'Contact support if the issue persists']
      };
    }
    
    // Handle unknown errors
    return {
      type: 'system',
      message: 'An unexpected error occurred',
      suggestions: ['Try again', 'Contact support if the issue persists']
    };
  }
};

export default ErrorMessaging;
