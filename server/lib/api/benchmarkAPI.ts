import axios, { AxiosInstance } from 'axios';
import { cacheManager } from './cache';
import type { ValuationFormData } from "@/lib/validations";

class BenchmarkAPI {
  // private clearbitAPI: AxiosInstance; // Removed Clearbit API client
  // private rateLimiter: APIRateLimiter; // Removed rate limiter

  constructor() {
    // Clearbit API initialization and rate limiting removed
  }

  private async fetchWithCache<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    expirySeconds: number = 86400
  ): Promise<T> {
    const cachedData = await cacheManager.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await fetchFn();
    await cacheManager.set(cacheKey, data, expirySeconds);
    return data;
  }


  // Enhanced mock data system with more realistic benchmarks
  async getIndustryBenchmarks(industry: string, stage: string) {
    const mockBenchmarks = {
      software_enterprise: {
        early_stage: {
          revenueMultiple: 8.5,
          ebitdaMultiple: 15.3,
          medianValuation: 5000000,
          avgFundingRound: 2000000,
          marketGrowthRate: 25
        },
        growth_stage: {
          revenueMultiple: 12.5,
          ebitdaMultiple: 25.3,
          medianValuation: 15000000,
          avgFundingRound: 8000000,
          marketGrowthRate: 20
        },
        mature_stage: {
          revenueMultiple: 6.5,
          ebitdaMultiple: 18.3,
          medianValuation: 50000000,
          avgFundingRound: 20000000,
          marketGrowthRate: 12
        }
      },
      biotech: {
        early_stage: {
          revenueMultiple: 12.2,
          ebitdaMultiple: 22.7,
          medianValuation: 8000000,
          avgFundingRound: 3000000,
          marketGrowthRate: 30
        },
        growth_stage: {
          revenueMultiple: 15.2,
          ebitdaMultiple: 28.7,
          medianValuation: 25000000,
          avgFundingRound: 12000000,
          marketGrowthRate: 25
        },
        mature_stage: {
          revenueMultiple: 8.2,
          ebitdaMultiple: 18.7,
          medianValuation: 75000000,
          avgFundingRound: 30000000,
          marketGrowthRate: 15
        }
      }
    };

    const stageMapping: Record<string, 'early_stage' | 'growth_stage' | 'mature_stage'> = {
      ideation_unvalidated: 'early_stage',
      ideation_validated: 'early_stage',
      mvp_development: 'early_stage',
      mvp_early_traction: 'early_stage',
      beta_testing: 'early_stage',
      revenue_early: 'early_stage',
      revenue_growing: 'growth_stage',
      revenue_scaling: 'growth_stage',
      growth_regional: 'growth_stage',
      growth_national: 'growth_stage',
      growth_international: 'growth_stage',
      mature_stable: 'mature_stage',
      mature_expanding: 'mature_stage',
      pre_ipo: 'mature_stage',
      acquisition_target: 'mature_stage'
    };

    const benchmarkStage = stageMapping[stage] || 'growth_stage';
    const industryBenchmarks = mockBenchmarks[industry as keyof typeof mockBenchmarks];

    return industryBenchmarks ? industryBenchmarks[benchmarkStage] : {
      revenueMultiple: 10.0,
      ebitdaMultiple: 20.0,
      medianValuation: 10000000,
      avgFundingRound: 5000000,
      marketGrowthRate: 15
    };
  }

  async getAllBenchmarkData(data: ValuationFormData) {
    try {
      const { industry, stage, sector } = data;

      const benchmarks = await this.getIndustryBenchmarks(industry, stage);

      return {
        industryBenchmarks: benchmarks,
        marketAnalysis: {
          totalAddressableMarket: this.calculateTAM(sector),
          competitiveLandscape: this.getCompetitiveLandscape(industry),
          growthProjections: benchmarks.marketGrowthRate
        }
      };
    } catch (error) {
      console.error('Error fetching benchmark data:', error);
      throw new Error('Failed to fetch benchmark data');
    }
  }

  private calculateTAM(sector: string): number {
    // Mock TAM calculations based on sector
    const tamBySector: Record<string, number> = {
      technology: 500000000000,
      healthtech: 450000000000,
      fintech: 300000000000,
      ecommerce: 250000000000,
      enterprise: 200000000000,
      deeptech: 150000000000,
      cleantech: 180000000000
    };

    return tamBySector[sector] || 100000000000;
  }

  private getCompetitiveLandscape(industry: string) {
    // Mock competitive landscape data
    return {
      competitorCount: Math.floor(Math.random() * 20) + 5,
      marketConcentration: 'moderate',
      barriers_to_entry: 'medium',
      key_success_factors: [
        'Strong IP Portfolio',
        'Network Effects',
        'First Mover Advantage'
      ]
    };
  }
}

export const benchmarkAPI = new BenchmarkAPI();