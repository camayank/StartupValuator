/**
 * Currency formatting utilities for Indian Rupees
 */

export function formatINR(amount: number, options?: {
  decimals?: number;
  shortForm?: boolean;
}): string {
  const { decimals = 2, shortForm = false } = options || {};

  if (shortForm) {
    return formatINRShort(amount, decimals);
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatINRShort(amount: number, decimals: number = 2): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 10000000) {
    // Crore
    return `${sign}₹${(absAmount / 10000000).toFixed(decimals)}Cr`;
  } else if (absAmount >= 100000) {
    // Lakh
    return `${sign}₹${(absAmount / 100000).toFixed(decimals)}L`;
  } else if (absAmount >= 1000) {
    // Thousand
    return `${sign}₹${(absAmount / 1000).toFixed(decimals)}K`;
  } else {
    return `${sign}₹${absAmount.toFixed(decimals)}`;
  }
}

export function parseCurrency(value: string): number {
  // Remove currency symbols and commas
  const cleaned = value.replace(/[₹,\s]/g, '');

  // Handle short forms
  const multipliers: Record<string, number> = {
    'cr': 10000000,
    'crore': 10000000,
    'l': 100000,
    'lakh': 100000,
    'lac': 100000,
    'k': 1000,
    'thousand': 1000,
  };

  for (const [suffix, multiplier] of Object.entries(multipliers)) {
    if (cleaned.toLowerCase().endsWith(suffix)) {
      const num = parseFloat(cleaned.slice(0, -suffix.length));
      return num * multiplier;
    }
  }

  return parseFloat(cleaned) || 0;
}

export function convertToINR(amount: number, fromCurrency: string): number {
  // Simplified conversion - in production, use real-time forex rates
  const rates: Record<string, number> = {
    'USD': 83,
    'EUR': 90,
    'GBP': 105,
    'SGD': 62,
    'AED': 22.6,
  };

  if (fromCurrency === 'INR') {
    return amount;
  }

  const rate = rates[fromCurrency.toUpperCase()];
  if (!rate) {
    throw new Error(`Unsupported currency: ${fromCurrency}`);
  }

  return amount * rate;
}
