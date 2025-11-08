/**
 * Sanity checks for startup valuation inputs
 * Prevents unrealistic data from producing misleading results
 */

import { formatINRShort } from './currency';

// Stage-based limits for Indian startups (in INR)
const STAGE_LIMITS = {
  pre_seed: {
    maxRevenue: 10000000,       // ₹1 Cr max
    maxValuation: 50000000,      // ₹5 Cr max
    maxEmployees: 20,
    minRevenuePerEmployee: 0,    // Can be pre-revenue
    maxRevenuePerEmployee: 5000000 // ₹50L per employee
  },
  seed: {
    maxRevenue: 50000000,        // ₹5 Cr
    maxValuation: 500000000,     // ₹50 Cr
    maxEmployees: 50,
    minRevenuePerEmployee: 100000,  // ₹1L per employee
    maxRevenuePerEmployee: 10000000 // ₹1Cr per employee
  },
  series_a: {
    maxRevenue: 500000000,       // ₹50 Cr
    maxValuation: 5000000000,    // ₹500 Cr
    maxEmployees: 200,
    minRevenuePerEmployee: 500000,   // ₹5L per employee
    maxRevenuePerEmployee: 20000000  // ₹2Cr per employee
  },
  series_b: {
    maxRevenue: 2000000000,      // ₹200 Cr
    maxValuation: 20000000000,   // ₹2,000 Cr
    maxEmployees: 500,
    minRevenuePerEmployee: 1000000,  // ₹10L per employee
    maxRevenuePerEmployee: 30000000  // ₹3Cr per employee
  },
  series_c: {
    maxRevenue: 10000000000,     // ₹1,000 Cr
    maxValuation: 100000000000,  // ₹10,000 Cr
    maxEmployees: 2000,
    minRevenuePerEmployee: 2000000,  // ₹20L per employee
    maxRevenuePerEmployee: 50000000  // ₹5Cr per employee
  },
  series_d_plus: {
    maxRevenue: 100000000000,    // ₹10,000 Cr
    maxValuation: 1000000000000, // ₹1,00,000 Cr
    maxEmployees: 10000,
    minRevenuePerEmployee: 5000000,   // ₹50L per employee
    maxRevenuePerEmployee: 100000000  // ₹10Cr per employee
  }
} as const;

export interface SanityCheckResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  shouldProceed: boolean;
  confidence: 'high' | 'medium' | 'low';
}

export interface BusinessInputs {
  stage: string;
  revenue: number;
  employees: number;
  currency: string;
  industry?: string;
}

/**
 * Validate business inputs against realistic bounds for the stage
 */
export function validateBusinessInputs(data: BusinessInputs): SanityCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get stage limits
  const stageLimits = STAGE_LIMITS[data.stage as keyof typeof STAGE_LIMITS];
  if (!stageLimits) {
    return {
      valid: false,
      errors: [`Unknown funding stage: ${data.stage}`],
      warnings: [],
      shouldProceed: false,
      confidence: 'low'
    };
  }

  // Convert to INR if needed
  const revenueINR = convertToINR(data.revenue, data.currency);

  // Check basic bounds
  if (data.employees < 0) {
    errors.push('Employee count cannot be negative');
  }

  if (data.employees === 0 && revenueINR > 0) {
    warnings.push(
      'Revenue reported with zero employees. Are you a solo founder? Please enter at least 1 employee.'
    );
  }

  // Revenue checks
  if (revenueINR > stageLimits.maxRevenue) {
    warnings.push(
      `Revenue of ${formatINRShort(revenueINR)} is unusually high for ${formatStage(data.stage)} stage. ` +
      `Typical maximum: ${formatINRShort(stageLimits.maxRevenue)}. ` +
      `Companies with this revenue are usually at later stages.`
    );
  }

  // Employee count checks
  if (data.employees > stageLimits.maxEmployees) {
    warnings.push(
      `${data.employees} employees is unusual for ${formatStage(data.stage)} stage. ` +
      `Typical maximum: ${stageLimits.maxEmployees} employees. ` +
      `This team size is more common in later-stage companies.`
    );
  }

  // Revenue per employee checks (efficiency metrics)
  if (data.employees > 0 && revenueINR > 0) {
    const revenuePerEmployee = revenueINR / data.employees;

    if (revenuePerEmployee > stageLimits.maxRevenuePerEmployee) {
      warnings.push(
        `Revenue per employee (${formatINRShort(revenuePerEmployee)}) is exceptionally high. ` +
        `Typical range for ${formatStage(data.stage)}: ${formatINRShort(stageLimits.minRevenuePerEmployee)} - ` +
        `${formatINRShort(stageLimits.maxRevenuePerEmployee)}. ` +
        `This suggests either extraordinary efficiency or potential data entry error.`
      );
    }

    if (data.stage !== 'pre_seed' && revenuePerEmployee < stageLimits.minRevenuePerEmployee) {
      warnings.push(
        `Revenue per employee (${formatINRShort(revenuePerEmployee)}) is below typical range. ` +
        `This may indicate overstaffing or efficiency challenges.`
      );
    }
  }

  // Industry-specific checks
  if (data.industry) {
    const industryWarnings = checkIndustrySpecific(data.industry, revenueINR, data.employees, data.stage);
    warnings.push(...industryWarnings);
  }

  // Determine overall confidence
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (warnings.length >= 3) {
    confidence = 'low';
  } else if (warnings.length >= 1) {
    confidence = 'medium';
  }

  // Should we let them proceed?
  const shouldProceed = errors.length === 0 && warnings.length < 4;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    shouldProceed,
    confidence
  };
}

/**
 * Convert revenue to INR for consistent comparison
 */
function convertToINR(amount: number, currency: string): number {
  const rates: Record<string, number> = {
    'INR': 1,
    'USD': 83.3,  // Updated Nov 2025
    'EUR': 90.5,
    'GBP': 105.0
  };

  return amount * (rates[currency] || 1);
}

/**
 * Format stage name for display
 */
function formatStage(stage: string): string {
  const names: Record<string, string> = {
    'pre_seed': 'Pre-seed',
    'seed': 'Seed',
    'series_a': 'Series A',
    'series_b': 'Series B',
    'series_c': 'Series C',
    'series_d_plus': 'Series D+'
  };

  return names[stage] || stage;
}

/**
 * Industry-specific sanity checks
 */
function checkIndustrySpecific(
  industry: string,
  revenueINR: number,
  employees: number,
  stage: string
): string[] {
  const warnings: string[] = [];

  // SaaS should have high revenue per employee
  if (industry === 'saas' && employees > 0) {
    const revenuePerEmployee = revenueINR / employees;
    if (revenuePerEmployee < 2000000 && stage !== 'pre_seed') {
      warnings.push(
        `For SaaS companies, revenue per employee is typically higher (₹20L+). ` +
        `Current: ${formatINRShort(revenuePerEmployee)}.`
      );
    }
  }

  // Manufacturing typically has lower revenue per employee
  if (industry === 'manufacturing' && employees > 0) {
    const revenuePerEmployee = revenueINR / employees;
    if (revenuePerEmployee > 5000000) {
      warnings.push(
        `For manufacturing, revenue per employee (${formatINRShort(revenuePerEmployee)}) ` +
        `seems unusually high. Please verify.`
      );
    }
  }

  // Edtech typically lower revenue in early stages
  if (industry === 'edtech' && stage === 'seed' && revenueINR > 30000000) {
    warnings.push(
      `Edtech companies at Seed stage typically have lower revenue (₹1-3Cr range). ` +
      `Revenue of ${formatINRShort(revenueINR)} is more typical of Series A.`
    );
  }

  return warnings;
}

/**
 * Quick validation for critical errors only (for API endpoints)
 */
export function validateCriticalErrors(data: BusinessInputs): string[] {
  const errors: string[] = [];

  if (data.employees < 0) {
    errors.push('Employee count cannot be negative');
  }

  if (data.revenue < 0) {
    errors.push('Revenue cannot be negative');
  }

  if (!data.stage) {
    errors.push('Funding stage is required');
  }

  // Absurd values that indicate clear data errors
  const revenueINR = convertToINR(data.revenue, data.currency);
  if (revenueINR > 1000000000000) { // ₹1 Lakh Crore
    errors.push('Revenue exceeds reasonable bounds. Please check your input.');
  }

  if (data.employees > 100000) {
    errors.push('Employee count exceeds reasonable bounds. Please check your input.');
  }

  return errors;
}
