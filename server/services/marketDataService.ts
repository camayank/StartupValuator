import { type ValuationFormData } from "../../client/src/lib/validations";
import { getCachedMarketSentiment } from "../lib/marketSentiment";

interface EconomicIndicators {
  inflation: number;
  riskFreeRate: number;
  gdpGrowth: number;
  marketVolatility: number;
  industryIndex: number;
  timestamp: string;
}

interface MarketData {
  economicIndicators: EconomicIndicators;
  industryMetrics: {
    growthRate: number;
    margins: number;
    revenueMultiple: number;
    timestamp: string;
  };
  peerComparison: {
    companies: Array<{
      name: string;
      metrics: Record<string, number>;
      similarity: number;
    }>;
    averages: {
      revenueMultiple: number;
      growthRate: number;
      margins: number;
    };
  };
}

// Cache configuration
const CACHE_DURATION = {
  ECONOMIC: 60 * 60 * 1000, // 1 hour for economic data
  INDUSTRY: 24 * 60 * 60 * 1000, // 24 hours for industry data
  PEER: 12 * 60 * 60 * 1000, // 12 hours for peer data
};

// Cache storage
const dataCache = new Map<string, { data: any; timestamp: number }>();

export class MarketDataService {
  private static instance: MarketDataService;

  private constructor() {}

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  async getMarketData(data: ValuationFormData): Promise<MarketData> {
    try {
      const [economicIndicators, industryMetrics, marketSentiment] = await Promise.all([
        this.getEconomicIndicators(data.region),
        this.getIndustryMetrics(data.sector),
        getCachedMarketSentiment(data),
      ]);

      return {
        economicIndicators,
        industryMetrics,
        peerComparison: marketSentiment.peerComparison || {
          companies: [],
          averages: { revenueMultiple: 0, growthRate: 0, margins: 0 },
        },
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      return this.getFallbackData(data.region);
    }
  }

  private async getEconomicIndicators(region: string): Promise<EconomicIndicators> {
    const cacheKey = `economic_${region}`;
    const cached = this.getFromCache(cacheKey, CACHE_DURATION.ECONOMIC);

    if (cached) {
      return cached as EconomicIndicators;
    }

    try {
      // In production, this would call actual APIs
      const indicators = await this.fetchEconomicIndicators(region);
      this.setCache(cacheKey, indicators);
      return indicators;
    } catch (error) {
      console.error('Error fetching economic indicators:', error);
      throw error;
    }
  }

  private async getIndustryMetrics(sector: string) {
    const cacheKey = `industry_${sector}`;
    const cached = this.getFromCache(cacheKey, CACHE_DURATION.INDUSTRY);

    if (cached) {
      return cached;
    }

    try {
      // In production, this would call industry data APIs
      const metrics = await this.fetchIndustryMetrics(sector);
      this.setCache(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching industry metrics:', error);
      throw error;
    }
  }

  private getFromCache(key: string, duration: number): any {
    const cached = dataCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < duration) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any) {
    dataCache.set(key, { data, timestamp: Date.now() });
  }

  private async fetchEconomicIndicators(region: string): Promise<EconomicIndicators> {
    // In production, replace with actual API calls
    const indicators = {
      us: {
        inflation: 3.2,
        riskFreeRate: 4.5,
        gdpGrowth: 2.1,
        marketVolatility: 15.2,
        industryIndex: 105.3,
      },
      india: {
        inflation: 5.5,
        riskFreeRate: 6.5,
        gdpGrowth: 6.3,
        marketVolatility: 18.5,
        industryIndex: 110.2,
      },
      // Add more regions as needed
    };

    return {
      ...(indicators[region.toLowerCase() as keyof typeof indicators] || indicators.us),
      timestamp: new Date().toISOString(),
    };
  }

  private async fetchIndustryMetrics(sector: string) {
    // In production, replace with actual API calls
    return {
      growthRate: 20,
      margins: 30,
      revenueMultiple: 8,
      timestamp: new Date().toISOString(),
    };
  }

  private getFallbackData(region: string): MarketData {
    return {
      economicIndicators: {
        inflation: 3.0,
        riskFreeRate: 4.0,
        gdpGrowth: 2.0,
        marketVolatility: 15.0,
        industryIndex: 100.0,
        timestamp: new Date().toISOString(),
      },
      industryMetrics: {
        growthRate: 10,
        margins: 20,
        revenueMultiple: 5,
        timestamp: new Date().toISOString(),
      },
      peerComparison: {
        companies: [],
        averages: {
          revenueMultiple: 5,
          growthRate: 10,
          margins: 20,
        },
      },
    };
  }
}
