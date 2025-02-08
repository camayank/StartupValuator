import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseCurrencyInput(value: string): number {
  // Remove any non-digit characters except decimal point
  const cleanValue = value.replace(/[^0-9.]/g, '');

  // Parse the clean value as a float
  const numberValue = parseFloat(cleanValue);

  // Return 0 if parsing fails
  return isNaN(numberValue) ? 0 : numberValue;
}