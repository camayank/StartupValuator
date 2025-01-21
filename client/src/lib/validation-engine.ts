import { z } from "zod";

interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

interface ValidationDependencies {
  [key: string]: string[];
}

const ValidationEngine = {
  validateNumber: (value: number, rules: ValidationRules): boolean => {
    if (typeof value !== 'number') return false;
    if (rules.min !== undefined && value < rules.min) return false;
    if (rules.max !== undefined && value > rules.max) return false;
    return true;
  },

  validateString: (value: string, rules: ValidationRules): boolean => {
    if (typeof value !== 'string') return false;
    if (rules.minLength !== undefined && value.length < rules.minLength) return false;
    if (rules.maxLength !== undefined && value.length > rules.maxLength) return false;
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

  // Additional helper methods for form validation
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
      }
      if (typeof value === 'string') {
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          return `Must be at least ${rules.minLength} characters`;
        }
        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          return `Must be at most ${rules.maxLength} characters`;
        }
      }
      return 'Invalid value';
    }
    return null;
  }
};

export default ValidationEngine;
