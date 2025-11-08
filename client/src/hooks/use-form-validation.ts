import { useState, useCallback } from 'react';
import { useValidation } from '@/contexts/ValidationContext';
import { type ValuationFormData } from '@/lib/types/shared';

interface ValidationState {
  errors: Record<string, string>;
  warnings: string[];
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

  const validateForm = useCallback(async (formData: ValuationFormData) => {
    setValidationState(prev => ({ ...prev, status: 'validating' }));

    try {
      // Basic validation
      const errors: Record<string, string> = {};
      const validationPromises = Object.entries(formData.businessInfo).map(async ([field, value]) => {
        const result = await validateField(field, value, {});
        if (result && !result.valid && result.message) {
          errors[field] = result.message;
        }
      });
      await Promise.all(validationPromises);

      // Cross-field validation
      if (formData.financialData?.revenue) {
        const crossResult = await validateCrossField('revenue', formData.financialData.revenue, formData);
        if (crossResult && !crossResult.valid && crossResult.message) {
          errors['revenue'] = crossResult.message;
        }
      }

      // AI-powered suggestions (collect for all fields)
      const allSuggestions: string[] = [];
      for (const field of Object.keys(formData.businessInfo)) {
        const suggestions = await getAISuggestions(field);
        allSuggestions.push(...suggestions);
      }

      setValidationState({
        errors,
        warnings: [],
        suggestions: allSuggestions,
        status: Object.keys(errors).length ? 'invalid' : 'valid',
        lastValidState: Object.keys(errors).length ? null : formData
      });

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        warnings: [],
        suggestions: allSuggestions
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
