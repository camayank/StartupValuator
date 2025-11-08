import React, { createContext, useContext, ReactNode } from 'react';

interface ValidationContextType {
  isValid: boolean;
  validateField: (field: string, value: any, options: any) => Promise<{ valid: boolean; message?: string }>;
  validateCrossField: (field: string, value: any, context: any) => Promise<{ valid: boolean; message?: string }>;
  getSmartDefaults: (field: string) => Promise<any>;
  getAISuggestions: (field: string) => Promise<string[]>;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

interface ValidationProviderProps {
  children: ReactNode;
}

export function ValidationProvider({ children }: ValidationProviderProps) {
  const value: ValidationContextType = {
    isValid: true,
    validateField: async (field: string, value: any, options: any) => ({ valid: true }),
    validateCrossField: async (field: string, value: any, context: any) => ({ valid: true }),
    getSmartDefaults: async (field: string) => null,
    getAISuggestions: async (field: string) => [],
  };

  return (
    <ValidationContext.Provider value={value}>
      {children}
    </ValidationContext.Provider>
  );
}

export function useValidation() {
  const context = useContext(ValidationContext);
  if (context === undefined) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
}