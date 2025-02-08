import type { ValuationFormData } from "../validations";
import { calculateFinancialMetrics } from "./financialMetricsService";
import axios from "axios";

interface MarketData {
  volatility: number;
  riskFreeRate: number;
  marketRiskPremium: number;
  industryBeta: number;
}

interface SimulationResult {
  expectedValue: number;
  confidenceIntervals: {
    p90: number;
    p75: number;
    p50: number;
    p25: number;
    p10: number;
    distributionData: Array<{ value: number; frequency: number }>;
  };
  iterations: number;
  sensitivityAnalysis: {
    factor: string;
    impact: number;
    correlation: number;
  }[];
  riskAnalysis: {
    industryRisks: Array<{
      factor: string;
      impact: number;
      probability: number;
    }>;
    correlationMatrix: Record<string, Record<string, number>>;
    volatilityMeasures: Record<string, number>;
  };
}

interface RiskFactor {
  name: string;
  baseImpact: number;
  volatility: number;
  correlation: Record<string, number>;
}

export class MonteCarloSimulation {
  private static readonly DEFAULT_ITERATIONS = 10000;
  private static readonly DEFAULT_CONFIDENCE_LEVEL = 0.95;
  private static readonly MARKET_DATA_API = "https://api.marketdata.com/v1";
  private static readonly API_KEY = process.env.MARKET_DATA_API_KEY;

  private static readonly RISK_FACTORS: Record<string, RiskFactor[]> = {
    technology: [
      {
        name: "tech_obsolescence",
        baseImpact: 0.15,
        volatility: 0.2,
        correlation: { market_growth: 0.3, competition: 0.5 }
      },
      {
        name: "cybersecurity",
        baseImpact: 0.12,
        volatility: 0.25,
        correlation: { regulatory: 0.4, reputation: 0.6 }
      },
      {
        name: "talent_retention",
        baseImpact: 0.1,
        volatility: 0.15,
        correlation: { market_conditions: 0.4, industry_growth: 0.3 }
      }
    ],
    // Add other sectors...
  };

  private static async fetchMarketData(sector: string): Promise<MarketData> {
    try {
      const response = await axios.get(`${this.MARKET_DATA_API}/market-metrics`, {
        params: {
          sector,
          api_key: this.API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      return {
        volatility: 0.25, // Default market volatility
        riskFreeRate: 0.03, // Default risk-free rate
        marketRiskPremium: 0.06, // Default market risk premium
        industryBeta: 1.2 // Default industry beta
      };
    }
  }

  static async runValuationSimulation(
    data: ValuationFormData,
    params: { iterations?: number; confidenceLevel?: number } = {}
  ): Promise<SimulationResult> {
    const {
      iterations = this.DEFAULT_ITERATIONS,
      confidenceLevel = this.DEFAULT_CONFIDENCE_LEVEL,
    } = params;

    // Fetch real-time market data
    const marketData = await this.fetchMarketData(data.businessInfo.sector);

    const results: number[] = [];
    const sensitivityData: Record<string, number[]> = {};
    const riskFactors = this.RISK_FACTORS[data.businessInfo.sector] || [];

    // Initialize enhanced correlation matrix
    const correlationMatrix = this.generateCorrelationMatrix(data.businessInfo.sector, marketData);
    const choleskyMatrix = this.computeCholeskyDecomposition(correlationMatrix);

    // Run simulations with enhanced risk modeling
    for (let i = 0; i < iterations; i++) {
      const correlatedRandoms = this.generateCorrelatedRandomVariables(choleskyMatrix);
      const riskAdjustments = this.calculateRiskAdjustments(riskFactors, marketData);

      // Generate simulated data with market conditions
      const simulatedData = this.generateSimulatedData(data, correlatedRandoms, riskAdjustments, marketData);
      const metrics = calculateFinancialMetrics(simulatedData);

      // Enhanced valuation calculation
      const valuation = this.calculateValuation(metrics, marketData);
      results.push(valuation);

      // Track variables for sensitivity analysis
      Object.entries(simulatedData).forEach(([key, value]) => {
        if (!sensitivityData[key]) sensitivityData[key] = [];
        sensitivityData[key].push(Number(value));
      });
    }

    // Sort results for percentile calculations
    results.sort((a, b) => a - b);

    return {
      expectedValue: this.calculateExpectedValue(results),
      confidenceIntervals: {
        ...this.calculateConfidenceIntervals(results),
        distributionData: this.generateDistributionData(results)
      },
      iterations,
      sensitivityAnalysis: this.performSensitivityAnalysis(sensitivityData, results),
      riskAnalysis: {
        industryRisks: this.analyzeIndustryRisks(riskFactors, results, marketData),
        correlationMatrix,
        volatilityMeasures: this.calculateVolatilityMeasures(results, sensitivityData)
      }
    };
  }

  private static generateDistributionData(results: number[]): Array<{ value: number; frequency: number }> {
    const buckets = 50;
    const min = Math.min(...results);
    const max = Math.max(...results);
    const bucketSize = (max - min) / buckets;

    const distribution = new Array(buckets).fill(0);
    results.forEach(value => {
      const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), buckets - 1);
      distribution[bucketIndex]++;
    });

    return distribution.map((count, i) => ({
      value: min + (i + 0.5) * bucketSize,
      frequency: count / results.length
    }));
  }

  private static generateCorrelationMatrix(sector: string, marketData: MarketData): Record<string, Record<string, number>> {
    // Start with base correlations (This part needs to be fleshed out based on your requirements)
    const matrix: Record<string, Record<string, number>> = {
      revenue: { margins: 0.3, growthRate: 0.5, marketSize: 0.4 },
      margins: { revenue: 0.3, growthRate: 0.2, marketSize: 0.1 },
      growthRate: { revenue: 0.5, margins: 0.2, marketSize: 0.4 },
      marketSize: { revenue: 0.4, margins: 0.1, growthRate: 0.4 }
    };

    //Incorporate market data and sector-specific adjustments here.  This is a placeholder.
    //The specific logic for incorporating marketData will depend on your data structure and intended correlations.
    //Example: Adjust based on market volatility.
    const volatilityFactor = marketData.volatility;
    for(const key1 in matrix){
      for(const key2 in matrix[key1]){
        matrix[key1][key2] *= (1 + volatilityFactor * 0.1);
      }
    }

    return matrix;
  }


  private static computeCholeskyDecomposition(matrix: Record<string, Record<string, number>>): number[][] {
    const n = Object.keys(matrix).length;
    const L: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = 0;
        for (let k = 0; k < j; k++) {
          sum += L[i][k] * L[j][k];
        }
        L[i][j] = i === j
          ? Math.sqrt(matrix[Object.keys(matrix)[i]][Object.keys(matrix)[i]] - sum)
          : (matrix[Object.keys(matrix)[i]][Object.keys(matrix)[j]] - sum) / L[j][j];
      }
    }

    return L;
  }

  private static generateCorrelatedRandomVariables(choleskyMatrix: number[][]): number[] {
    const n = choleskyMatrix.length;
    const independentRandoms = Array(n).fill(0).map(() => this.generateNormalRandom());
    const correlatedRandoms = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      correlatedRandoms[i] = 0;
      for (let j = 0; j <= i; j++) {
        correlatedRandoms[i] += choleskyMatrix[i][j] * independentRandoms[j];
      }
    }

    return correlatedRandoms;
  }

  private static generateNormalRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  private static calculateRiskAdjustments(
    riskFactors: RiskFactor[],
    marketData: MarketData
  ): number {
    return riskFactors.reduce((total, risk) => {
      const randomFactor = this.generateNormalRandom() * risk.volatility;
      // Incorporate market data into risk adjustment
      const marketImpact = marketData.volatility * risk.correlation.market_growth; // Example correlation
      return total + (risk.baseImpact * (1 + randomFactor + marketImpact));
    }, 1);
  }

  private static generateSimulatedData(
    baseData: ValuationFormData,
    correlatedRandoms: number[],
    riskAdjustment: number,
    marketData: MarketData
  ): ValuationFormData {
    const simulatedData = { ...baseData };

    if (simulatedData.financialData) {
      const [revenueRandom, marginsRandom, growthRandom] = correlatedRandoms;

      simulatedData.financialData = {
        ...simulatedData.financialData,
        revenue: this.applyRandomVariation(simulatedData.financialData.revenue, 0.2, revenueRandom) * riskAdjustment,
        cac: this.applyRandomVariation(simulatedData.financialData.cac, 0.15, marginsRandom),
        ltv: this.applyRandomVariation(simulatedData.financialData.ltv, 0.25, growthRandom),
      };
    }

    return simulatedData;
  }

  private static applyRandomVariation(
    baseValue: number,
    variationRange: number,
    correlatedRandom: number
  ): number {
    return baseValue * (1 + correlatedRandom * variationRange);
  }

  private static calculateVolatilityMeasures(
    results: number[],
    sensitivityData: Record<string, number[]>
  ): Record<string, number> {
    const measures: Record<string, number> = {};

    for (const [key, values] of Object.entries(sensitivityData)) {
      const mean = values.reduce((a, b) => a + b) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      measures[key] = Math.sqrt(variance) / mean; // Coefficient of variation
    }

    return measures;
  }

  private static analyzeIndustryRisks(
    riskFactors: RiskFactor[],
    results: number[],
    marketData: MarketData
  ): Array<{ factor: string; impact: number; probability: number }> {
    return riskFactors.map(risk => ({
      factor: risk.name,
      impact: risk.baseImpact * (1 + marketData.volatility * risk.correlation.market_growth), //Example, adjust as needed
      probability: this.calculateRiskProbability(risk, results)
    }));
  }

    private static calculateRiskProbability(
    risk: RiskFactor,
    results: number[]
  ): number {
    const mean = this.calculateExpectedValue(results);
    const impactThreshold = mean * (1 - risk.baseImpact);
    return results.filter(r => r < impactThreshold).length / results.length;
  }

  private static calculateExpectedValue(results: number[]): number {
    return results.reduce((a, b) => a + b) / results.length;
  }

  private static calculateConfidenceIntervals(sortedResults: number[]): {
    p90: number;
    p75: number;
    p50: number;
    p25: number;
    p10: number;
  } {
    const getPercentile = (p: number) => {
      const index = Math.floor((p / 100) * (sortedResults.length - 1));
      return sortedResults[index];
    };

    return {
      p90: getPercentile(90),
      p75: getPercentile(75),
      p50: getPercentile(50),
      p25: getPercentile(25),
      p10: getPercentile(10),
    };
  }

  private static performSensitivityAnalysis(
    sensitivityData: Record<string, number[]>,
    results: number[]
  ) {
    return Object.entries(sensitivityData).map(([factor, values]) => {
      const correlation = this.calculateCorrelation(values, results);
      const impact = Math.abs(correlation);
      return {
        factor,
        impact,
        correlation,
      };
    });
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sum1 = x.reduce((a, b) => a + b);
    const sum2 = y.reduce((a, b) => a + b);
    const sum1Sq = x.reduce((a, b) => a + b * b);
    const sum2Sq = y.reduce((a, b) => a + b * b);
    const pSum = x.map((x, i) => x * y[i]).reduce((a, b) => a + b);
    const num = pSum - (sum1 * sum2) / n;
    const den = Math.sqrt(
      (sum1Sq - (sum1 * sum1) / n) * (sum2Sq - (sum2 * sum2) / n)
    );
    return den === 0 ? 0 : num / den;
  }

  private static calculateValuation(metrics: any, marketData: MarketData): number {
    // Implement valuation calculation based on metrics and market data
    const revenueMultiple = 5 + Math.random() * 3; // Example multiple range 5-8x
    // Incorporate market risk premium into valuation
    const riskAdjustedMultiple = revenueMultiple * (1 + marketData.marketRiskPremium);
    return metrics.revenue.arr * riskAdjustedMultiple;
  }
}

export type { SimulationResult, MarketData, RiskFactor };