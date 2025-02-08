import { useState, useCallback } from 'react';
import { useValidation } from '@/contexts/ValidationContext';
import { type ValuationFormInput, type ValidationResult } from '@/lib/validation/aiValidation';

interface ValidationState {
  errors: Record<string, string>;
  warnings: ValidationResult['warnings'];
  suggestions: string[];
  status: 'idle' | 'validating' | 'valid' | 'invalid';
  lastValidState: any | null;
}

export function useFormValidation(initialState = {}) {
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    warnings: [],
    suggestions: [],
    status: 'idle',
    lastValidState: null
  });

  const { validateField, validateCrossField, getAISuggestions } = useValidation();

  const validateForm = useCallback(async (formData: ValuationFormInput) => {
    setValidationState(prev => ({ ...prev, status: 'validating' }));

    try {
      // Basic validation
      const errors: Record<string, string> = {};
      Object.entries(formData.businessInfo).forEach(([field, value]) => {
        const error = validateField(field, value, {});
        if (error) errors[field] = error;
      });

      // Cross-field validation
      const crossErrors = validateCrossField('revenue', formData.financialMetrics?.revenue, formData);
      if (crossErrors) {
        Object.assign(errors, crossErrors);
      }

      // AI-powered validation
      const aiValidation = await getAISuggestions(formData);

      setValidationState({
        errors,
        warnings: aiValidation.warnings,
        suggestions: aiValidation.suggestions || [],
        status: Object.keys(errors).length ? 'invalid' : 'valid',
        lastValidState: Object.keys(errors).length ? null : formData
      });

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        warnings: aiValidation.warnings,
        suggestions: aiValidation.suggestions
      };
    } catch (error) {
      console.error('Validation error:', error);
      setValidationState(prev => ({
        ...prev,
        status: 'invalid',
        errors: { _form: 'Validation failed unexpectedly' }
      }));

      return {
        isValid: false,
        errors: { _form: 'Validation failed unexpectedly' },
        warnings: [],
        suggestions: []
      };
    }
  }, [validateField, validateCrossField, getAISuggestions]);

  const resetValidation = useCallback(() => {
    setValidationState({
      errors: {},
      warnings: [],
      suggestions: [],
      status: 'idle',
      lastValidState: null
    });
  }, []);

  const restoreLastValidState = useCallback(() => {
    if (validationState.lastValidState) {
      return validationState.lastValidState;
    }
    return null;
  }, [validationState.lastValidState]);

  return {
    validationState,
    validateForm,
    resetValidation,
    restoreLastValidState
  };
}
