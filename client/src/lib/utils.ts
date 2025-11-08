import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  if (currency === 'INR') {
    return formatINR(value);
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format Indian currency with full number format (₹1,50,00,000)
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format Indian currency in short form (₹5.2Cr, ₹40L)
export function formatINRShort(amount: number, decimals: number = 2): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 10000000) {
    // Crores (1 Crore = 10 Million)
    return `${sign}₹${(absAmount / 10000000).toFixed(decimals)}Cr`;
  } else if (absAmount >= 100000) {
    // Lakhs (1 Lakh = 100 Thousand)
    return `${sign}₹${(absAmount / 100000).toFixed(decimals)}L`;
  } else if (absAmount >= 1000) {
    // Thousands
    return `${sign}₹${(absAmount / 1000).toFixed(decimals)}K`;
  }

  return `${sign}₹${absAmount.toFixed(decimals)}`;
}

// Get currency symbol based on currency code
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  return symbols[currency] || '$';
}

export function parseCurrencyInput(value: string): number {
  // Remove any non-digit characters except decimal point
  const cleanValue = value.replace(/[^0-9.]/g, '');

  // Parse the clean value as a float
  const numberValue = parseFloat(cleanValue);

  // Return 0 if parsing fails
  return isNaN(numberValue) ? 0 : numberValue;
}