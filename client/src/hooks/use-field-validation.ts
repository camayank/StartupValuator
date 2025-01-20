import { useEffect, useState } from "react";
import { fieldValidations, validateField, type ValidationContext } from "@/lib/validations/field-validations";
import { useToast } from "@/hooks/use-toast";

type ValidationState = Record<string, {
  isValid: boolean;
  warnings: string[];
}>;

export function useFieldValidation(context: ValidationContext) {
  const { toast } = useToast();
  const [validationState, setValidationState] = useState<ValidationState>({});

  // Validate a single field
  const validateSingleField = (fieldName: keyof typeof fieldValidations, value: any) => {
    const result = validateField(fieldName, value, context);

    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        isValid: result.isValid,
        warnings: result.warnings
      }
    }));

    // Show warnings as toasts
    result.warnings.forEach(warning => {
      toast({
        title: `Recommendation for ${fieldName}`,
        description: warning,
        variant: "destructive"
      });
    });

    return result.isValid;
  };

  // Get dependent field requirements
  const getDependentFields = (fieldName: keyof typeof fieldValidations) => {
    const validation = fieldValidations[fieldName];
    return validation.dependencies;
  };

  // Check if a field should be required based on context
  const isFieldRequired = (fieldName: keyof typeof fieldValidations) => {
    const validation = fieldValidations[fieldName];

    // Base requirement
    if (validation.required) return true;

    // Check sector-specific requirements
    if (context.sector && 
        validation.sectorSpecificRules?.[context.sector]?.required) {
      return true;
    }

    // Check stage-specific requirements
    if (context.stage && 
        validation.stageSpecificRules?.[context.stage]?.required) {
      return true;
    }

    return false;
  };

  // Get smart default value for a field
  const getSmartDefault = (fieldName: keyof typeof fieldValidations) => {
    const validation = fieldValidations[fieldName];

    // Check sector-specific defaults
    if (context.sector && 
        validation.sectorSpecificDefaults?.[context.sector]) {
      return validation.sectorSpecificDefaults[context.sector];
    }

    // Check region-specific defaults
    if (context.region && 
        validation.regionSpecificDefaults?.[context.region]) {
      return validation.regionSpecificDefaults[context.region];
    }

    return validation.defaultValue;
  };

  return {
    validateField: validateSingleField,
    validationState,
    getDependentFields,
    isFieldRequired,
    getSmartDefault
  };
}