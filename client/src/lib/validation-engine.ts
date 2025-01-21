import { z } from "zod";

interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  required?: boolean;
  format?: 'integer' | 'currency' | 'percentage';
}

interface ValidationDependencies {
  [key: string]: string[];
}

interface BusinessRule {
  validate: (value: any, formData: Record<string, any>) => string[];
  errorMessages?: Record<string, string>;
}

const ValidationEngine = {
  validateNumber: (value: number, rules: ValidationRules): boolean => {
    if (typeof value !== 'number') return false;
    if (rules.min !== undefined && value < rules.min) return false;
    if (rules.max !== undefined && value > rules.max) return false;

    if (rules.format === 'integer' && !Number.isInteger(value)) return false;
    if (rules.format === 'percentage' && (value < 0 || value > 100)) return false;

    return true;
  },

  validateString: (value: string, rules: ValidationRules): boolean => {
    if (typeof value !== 'string') return false;
    if (rules.minLength !== undefined && value.length < rules.minLength) return false;
    if (rules.maxLength !== undefined && value.length > rules.maxLength) return false;
    if (rules.pattern && !rules.pattern.test(value)) return false;
    return true;
  },

  validateDependencies: (fields: Record<string, any>, dependencies: ValidationDependencies): boolean => {
    return Object.entries(dependencies).every(([field, deps]) => {
      if (fields[field]) {
        return deps.every(dep => fields[dep] && fields[dep].isValid);
      }
      return true;
    });
  },

  validateBusinessRules: (field: string, value: any, formData: Record<string, any>, rules: Record<string, BusinessRule>): string[] => {
    const errors: string[] = [];
    const rule = rules[field];

    if (rule) {
      const ruleErrors = rule.validate(value, formData);
      errors.push(...ruleErrors);
    }

    return errors;
  },

  // Field validation with detailed error messages
  validateField: (fieldName: string, value: any, rules: ValidationRules): boolean => {
    switch (typeof value) {
      case 'number':
        return ValidationEngine.validateNumber(value, rules);
      case 'string':
        return ValidationEngine.validateString(value, rules);
      default:
        return false;
    }
  },

  getValidationError: (fieldName: string, value: any, rules: ValidationRules): string | null => {
    if (!ValidationEngine.validateField(fieldName, value, rules)) {
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          return `Value must be at least ${rules.min}`;
        }
        if (rules.max !== undefined && value > rules.max) {
          return `Value must be at most ${rules.max}`;
        }
        if (rules.format === 'integer' && !Number.isInteger(value)) {
          return 'Value must be a whole number';
        }
        if (rules.format === 'percentage' && (value < 0 || value > 100)) {
          return 'Percentage must be between 0 and 100';
        }
      }

      if (typeof value === 'string') {
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          return `Must be at least ${rules.minLength} characters`;
        }
        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          return `Must be at most ${rules.maxLength} characters`;
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          return 'Invalid format';
        }
      }

      if (rules.required && (value === undefined || value === null || value === '')) {
        return 'This field is required';
      }

      return 'Invalid value';
    }
    return null;
  },

  // Form section validation
  validateSection: (sectionName: string, formData: Record<string, any>, rules: Record<string, ValidationRules>): {
    isValid: boolean;
    errors: Map<string, string[]>;
  } => {
    const errors = new Map<string, string[]>();

    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
      const value = formData[fieldName];
      const error = ValidationEngine.getValidationError(fieldName, value, fieldRules);

      if (error) {
        errors.set(fieldName, [error]);
      }
    });

    return {
      isValid: errors.size === 0,
      errors
    };
  }
};

export default ValidationEngine;