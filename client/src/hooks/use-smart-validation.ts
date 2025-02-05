import { useEffect, useState } from "react";
import {
  fieldValidationRules,
  getValidationRequirements,
  type ValidationContext
} from "@/lib/validations/validation-overview";
import { useToast } from "@/hooks/use-toast";
import { ValidationEngine } from "@/lib/validation-engine";
import { TooltipSystem } from "@/lib/tooltip-system";
import BusinessRulesEngine from "@/lib/business-rules-engine";

type ValidationState = Record<string, {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
  required: boolean;
  tooltip?: string;
}>;

export function useSmartValidation(context: ValidationContext) {
  const { toast } = useToast();
  const [validationState, setValidationState] = useState<ValidationState>({});
  const [lastCheckedValue, setLastCheckedValue] = useState<Record<string, any>>({});

  // Validate a single field with real-time feedback
  const validateField = (fieldName: keyof typeof fieldValidationRules, value: any, formData?: any) => {
    const requirements = getValidationRequirements(fieldName, context);
    if (!requirements) return true;

    // Don't re-validate if value hasn't changed
    if (lastCheckedValue[fieldName] === value) {
      return validationState[fieldName]?.isValid ?? true;
    }

    setLastCheckedValue(prev => ({ ...prev, [fieldName]: value }));

    const result = {
      isValid: true,
      warnings: [] as string[],
      suggestions: [] as string[],
      required: requirements.required,
      tooltip: TooltipSystem.getFieldTooltip(fieldName)?.text
    };

    // Basic validation
    if (!ValidationEngine.validateField(fieldName, value, requirements)) {
      result.isValid = false;
      const error = ValidationEngine.getValidationError(fieldName, value, requirements);
      if (error) {
        result.warnings.push(error);
        result.suggestions.push(...getSuggestionsForError(fieldName, error, context));
      }
    }

    // Business rules validation if form data is provided
    if (formData) {
      const businessValidation = BusinessRulesEngine.validateField(fieldName, value, formData);
      if (!businessValidation.isValid) {
        result.warnings.push(...(businessValidation.warnings || []));
        result.suggestions.push(...(businessValidation.suggestions || []));
      }
    }

    // Show immediate feedback for serious issues
    if (!result.isValid && result.warnings.length > 0) {
      toast({
        title: `Validation Issue: ${fieldName}`,
        description: result.warnings[0],
        variant: "destructive",
      });

      // Show suggestions as follow-up toasts
      if (result.suggestions.length > 0) {
        setTimeout(() => {
          toast({
            title: "Suggestions",
            description: result.suggestions[0],
            variant: "default",
          });
        }, 500);
      }
    }

    setValidationState(prev => ({
      ...prev,
      [fieldName]: result
    }));

    return result.isValid;
  };

  // Get smart suggestions based on error type
  const getSuggestionsForError = (fieldName: string, error: string, context: ValidationContext): string[] => {
    // Basic suggestion lookup
    const commonSuggestions: Record<string, string[]> = {
      required: ["This field is required for accurate valuation"],
      format: ["Check the input format", "Review example values"],
      range: ["Value is outside expected range", "Compare with industry benchmarks"]
    };

    // Context-aware suggestions
    if (context.sector) {
      return [
        ...(commonSuggestions[error] || []),
        `Compare with typical ${context.sector} industry values`,
        `Review ${context.sector} sector benchmarks`
      ];
    }

    return commonSuggestions[error] || ["Please review the input value"];
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

  // Get real-time smart suggestions for a field
  const getSmartSuggestions = (fieldName: string, value: any): string[] => {
    const state = validationState[fieldName];
    if (!state) return [];

    return state.suggestions;
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
    getSmartSuggestions
  };
}