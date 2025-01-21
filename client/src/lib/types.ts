import { z } from "zod";

export interface ValidationResult {
  isValid: boolean;
  severity: 'info' | 'warning' | 'error';
  message?: string;
  suggestions?: string[];
  impact?: 'low' | 'medium' | 'high';
}

// Basic form data interface used by both validation and business rules
export interface BasicFormData {
  stage: string;
  sector: string;
  revenue?: number;
  employeeCount?: number;
  customerBase?: number;
}
