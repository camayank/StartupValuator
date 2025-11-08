/**
 * Currency Exchange Rate Service
 * Fetches live exchange rates and provides fallback to recent rates
 */

interface ExchangeRates {
  INR: number;
  USD: number;
  EUR: number;
  GBP: number;
  lastUpdated: Date;
}

// Fallback rates (updated as of Jan 2025)
const FALLBACK_RATES: Record<string, number> = {
  INR: 1,
  USD: 83.5,
  EUR: 91.5,
  GBP: 106.2
};

// Cache for exchange rates (avoid hitting API too frequently)
let cachedRates: ExchangeRates | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Get current exchange rates (to INR)
 * Uses cache if available and recent, otherwise fetches fresh rates
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now();

  // Return cached rates if still valid
  if (cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
    return {
      INR: cachedRates.INR,
      USD: cachedRates.USD,
      EUR: cachedRates.EUR,
      GBP: cachedRates.GBP
    };
  }

  // Try to fetch fresh rates
  try {
    const rates = await fetchLiveRates();
    cachedRates = {
      ...rates,
      lastUpdated: new Date()
    };
    lastFetchTime = now;
    return rates;
  } catch (error) {
    console.warn('Failed to fetch live exchange rates, using fallback:', error);

    // Update cache with fallback rates
    if (!cachedRates) {
      cachedRates = {
        ...FALLBACK_RATES,
        lastUpdated: new Date()
      };
    }

    return FALLBACK_RATES;
  }
}

/**
 * Fetch live exchange rates from API
 * Using exchangerate-api.com (free tier: 1500 requests/month)
 */
async function fetchLiveRates(): Promise<Record<string, number>> {
  // Option 1: exchangerate-api.com (free, no API key needed)
  const API_URL = 'https://api.exchangerate-api.com/v4/latest/INR';

  const response = await fetch(API_URL, {
    headers: {
      'Accept': 'application/json'
    },
    signal: AbortSignal.timeout(5000) // 5 second timeout
  });

  if (!response.ok) {
    throw new Error(`Exchange rate API returned ${response.status}`);
  }

  const data = await response.json();

  // API returns rates FROM INR, we need rates TO INR
  // So we need to invert the rates
  return {
    INR: 1,
    USD: 1 / data.rates.USD,  // Convert: 1 USD = X INR
    EUR: 1 / data.rates.EUR,
    GBP: 1 / data.rates.GBP
  };
}

/**
 * Convert amount from one currency to INR
 */
export async function convertToINR(amount: number, fromCurrency: string): Promise<number> {
  const rates = await getExchangeRates();
  const rate = rates[fromCurrency] || 1;
  return amount * rate;
}

/**
 * Convert amount from INR to another currency
 */
export async function convertFromINR(amount: number, toCurrency: string): Promise<number> {
  const rates = await getExchangeRates();
  const rate = rates[toCurrency] || 1;
  return amount / rate;
}

/**
 * Get formatted exchange rate info (for display)
 */
export async function getExchangeRateInfo(): Promise<{
  rates: Record<string, number>;
  lastUpdated: Date;
  isLive: boolean;
}> {
  const rates = await getExchangeRates();

  return {
    rates,
    lastUpdated: cachedRates?.lastUpdated || new Date(),
    isLive: cachedRates !== null && (Date.now() - lastFetchTime) < CACHE_DURATION
  };
}

/**
 * Manually refresh exchange rates (force fetch)
 */
export async function refreshExchangeRates(): Promise<void> {
  lastFetchTime = 0; // Invalidate cache
  await getExchangeRates();
}
