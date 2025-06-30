import React, { createContext, useContext, ReactNode } from 'react';

interface ValidationContextType {
  // Add validation context properties as needed
  isValid: boolean;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

interface ValidationProviderProps {
  children: ReactNode;
}

export function ValidationProvider({ children }: ValidationProviderProps) {
  const value: ValidationContextType = {
    isValid: true
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