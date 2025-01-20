import { useEffect, useState } from "react";
import {
  fieldValidationRules,
  getValidationRequirements,
  type ValidationContext
} from "@/lib/validations/validation-overview";
import { useToast } from "@/hooks/use-toast";

type ValidationState = Record<string, {
  isValid: boolean;
  warnings: string[];
  required: boolean;
}>;

export function useSmartValidation(context: ValidationContext) {
  const { toast } = useToast();
  const [validationState, setValidationState] = useState<ValidationState>({});

  // Validate a single field
  const validateField = (fieldName: keyof typeof fieldValidationRules, value: any) => {
    const requirements = getValidationRequirements(fieldName, context);
    if (!requirements) return true;

    const result = {
      isValid: true,
      warnings: requirements.warnings,
      required: requirements.required
    };

    // Show warnings as toasts
    requirements.warnings.forEach(warning => {
      toast({
        title: `Recommendation for ${fieldName}`,
        description: warning,
        variant: "destructive", // Updated to match allowed variants
      });
    });

    setValidationState(prev => ({
      ...prev,
      [fieldName]: result
    }));

    return result.isValid;
  };

  // Get dependent fields that should be validated
  const getDependentFields = (fieldName: keyof typeof fieldValidationRules): string[] => {
    const requirements = getValidationRequirements(fieldName, context);
    return requirements?.dependencies || [];
  };

  // Check if a field should be required based on context
  const isFieldRequired = (fieldName: keyof typeof fieldValidationRules): boolean => {
    const requirements = getValidationRequirements(fieldName, context);
    return requirements?.required || false;
  };

  // Validate all fields when context changes
  useEffect(() => {
    Object.keys(fieldValidationRules).forEach(fieldName => {
      validateField(fieldName as keyof typeof fieldValidationRules, null);
    });
  }, [context.sector, context.stage, context.revenue]);

  return {
    validateField,
    validationState,
    getDependentFields,
    isFieldRequired,
  };
}