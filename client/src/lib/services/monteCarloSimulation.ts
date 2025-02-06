import type { ValuationFormData } from "../validations";
import { calculateFinancialMetrics } from "./financialMetricsService";

interface SimulationResult {
  expectedValue: number;
  confidenceIntervals: {
    p90: number;
    p75: number;
    p50: number;
    p25: number;
    p10: number;
  };
  iterations: number;
  sensitivityAnalysis: {
    factor: string;
    impact: number;
    correlation: number;
  }[];
}

interface SimulationParams {
  iterations?: number;
  confidenceLevel?: number;
  variables?: string[];
}

export class MonteCarloSimulation {
  private static readonly DEFAULT_ITERATIONS = 10000;
  private static readonly DEFAULT_CONFIDENCE_LEVEL = 0.95;

  static async runValuationSimulation(
    data: ValuationFormData,
    params: SimulationParams = {}
  ): Promise<SimulationResult> {
    const {
      iterations = this.DEFAULT_ITERATIONS,
      confidenceLevel = this.DEFAULT_CONFIDENCE_LEVEL,
    } = params;

    const results: number[] = [];
    const sensitivityData: Record<string, number[]> = {};

    // Run simulations
    for (let i = 0; i < iterations; i++) {
      const simulatedData = this.generateSimulatedData(data);
      const metrics = calculateFinancialMetrics(simulatedData);
      const valuation = this.calculateValuation(metrics);
      results.push(valuation);

      // Track variable impacts for sensitivity analysis
      Object.entries(simulatedData).forEach(([key, value]) => {
        if (!sensitivityData[key]) sensitivityData[key] = [];
        sensitivityData[key].push(Number(value));
      });
    }

    // Sort results for percentile calculations
    results.sort((a, b) => a - b);

    // Calculate confidence intervals
    const intervals = this.calculateConfidenceIntervals(results);

    // Perform sensitivity analysis
    const sensitivityAnalysis = this.performSensitivityAnalysis(
      sensitivityData,
      results
    );

    return {
      expectedValue: results.reduce((a, b) => a + b) / results.length,
      confidenceIntervals: intervals,
      iterations,
      sensitivityAnalysis,
    };
  }

  private static generateSimulatedData(
    baseData: ValuationFormData
  ): ValuationFormData {
    const simulatedData = { ...baseData };

    // Apply random variations to key metrics
    if (simulatedData.financialData) {
      simulatedData.financialData = {
        ...simulatedData.financialData,
        revenue: this.applyRandomVariation(simulatedData.financialData.revenue, 0.2),
        margins: this.applyRandomVariation(simulatedData.financialData.margins, 0.15),
        growthRate: this.applyRandomVariation(simulatedData.financialData.growthRate, 0.25),
      };
    }

    if (simulatedData.marketData) {
      simulatedData.marketData = {
        ...simulatedData.marketData,
        tam: this.applyRandomVariation(simulatedData.marketData.tam, 0.1),
        sam: this.applyRandomVariation(simulatedData.marketData.sam, 0.15),
        som: this.applyRandomVariation(simulatedData.marketData.som, 0.2),
      };
    }

    return simulatedData;
  }

  private static applyRandomVariation(
    baseValue: number,
    variationRange: number
  ): number {
    const variation = 1 + (Math.random() * 2 - 1) * variationRange;
    return baseValue * variation;
  }

  private static calculateValuation(metrics: any): number {
    // Implement valuation calculation based on metrics
    const revenueMultiple = 5 + Math.random() * 3; // Example multiple range 5-8x
    return metrics.revenue.arr * revenueMultiple;
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
      return {
        factor,
        impact: Math.abs(correlation),
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
}
