import { useEffect, useState } from "react";
import { useValidation } from "@/contexts/ValidationContext";
import { useToast } from "@/hooks/use-toast";

export type ValidationState = Record<string, {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}>;

export interface ValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showToasts?: boolean;
}

export function useFieldValidation(context: any, options: ValidationOptions = {}) {
  const { toast } = useToast();
  const { validateField, validateCrossField, getSmartDefaults } = useValidation();
  const [validationState, setValidationState] = useState<ValidationState>({});
  const [isValidating, setIsValidating] = useState(false);
  const [fieldDefaults, setFieldDefaults] = useState<Record<string, any>>({});

  // Load smart defaults when industry changes
  useEffect(() => {
    if (context.industry) {
      getSmartDefaults(context.industry).then(defaults => {
        setFieldDefaults(defaults);
      });
    }
  }, [context.industry]);

  const validateSingleField = async (fieldName: string, value: any) => {
    setIsValidating(true);
    try {
      // Basic field validation
      const fieldError = await validateField(fieldName, value, {});

      // Cross-field validation
      const crossFieldError = await validateCrossField(fieldName, value, context);

      // Combine errors - extract messages from validation results
      const errors: string[] = [];
      if (fieldError && !fieldError.valid && fieldError.message) {
        errors.push(fieldError.message);
      }
      if (crossFieldError && !crossFieldError.valid && crossFieldError.message) {
        errors.push(crossFieldError.message);
      }

      // Update validation state
      setValidationState(prev => ({
        ...prev,
        [fieldName]: {
          isValid: errors.length === 0,
          errors,
          warnings: [],
          suggestions: []
        }
      }));

      // Show validation feedback if enabled
      if (options.showToasts && errors.length > 0) {
        toast({
          title: "Validation Error",
          description: errors[0],
          variant: "destructive"
        });
      }

      return errors.length === 0;
    } catch (error) {
      console.error(`Validation error for ${fieldName}:`, error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const validateForm = async (formData: Record<string, any>) => {
    const validationPromises = Object.entries(formData).map(([field, value]) =>
      validateSingleField(field, value)
    );

    const results = await Promise.all(validationPromises);
    return results.every(Boolean);
  };

  const getFieldDefault = (fieldName: string) => {
    return fieldDefaults[fieldName];
  };

  const clearValidation = (fieldName?: string) => {
    if (fieldName) {
      setValidationState(prev => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
    } else {
      setValidationState({});
    }
  };

  return {
    validationState,
    isValidating,
    validateField: validateSingleField,
    validateForm,
    getFieldDefault,
    clearValidation,
    fieldDefaults
  };
}