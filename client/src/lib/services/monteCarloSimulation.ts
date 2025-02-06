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

interface SimulationParams {
  iterations?: number;
  confidenceLevel?: number;
  variables?: string[];
  industryRiskFactors?: Array<{
    name: string;
    baseImpact: number;
    volatility: number;
  }>;
}

export class MonteCarloSimulation {
  private static readonly DEFAULT_ITERATIONS = 10000;
  private static readonly DEFAULT_CONFIDENCE_LEVEL = 0.95;

  // Industry-specific risk factors and their base impacts
  private static readonly INDUSTRY_RISK_FACTORS: Record<string, Array<{ name: string; baseImpact: number; volatility: number }>> = {
    technology: [
      { name: "tech_obsolescence", baseImpact: 0.15, volatility: 0.2 },
      { name: "cybersecurity", baseImpact: 0.12, volatility: 0.25 },
      { name: "talent_retention", baseImpact: 0.1, volatility: 0.15 }
    ],
    fintech: [
      { name: "regulatory_changes", baseImpact: 0.2, volatility: 0.3 },
      { name: "market_volatility", baseImpact: 0.15, volatility: 0.25 },
      { name: "cybersecurity", baseImpact: 0.15, volatility: 0.2 }
    ],
    healthtech: [
      { name: "regulatory_approval", baseImpact: 0.25, volatility: 0.3 },
      { name: "clinical_trials", baseImpact: 0.2, volatility: 0.25 },
      { name: "reimbursement", baseImpact: 0.15, volatility: 0.2 }
    ]
  };

  // Correlation matrix for key financial metrics
  private static readonly BASE_CORRELATION_MATRIX: Record<string, Record<string, number>> = {
    revenue: {
      margins: 0.3,
      growthRate: 0.5,
      marketSize: 0.4
    },
    margins: {
      revenue: 0.3,
      growthRate: 0.2,
      marketSize: 0.1
    },
    growthRate: {
      revenue: 0.5,
      margins: 0.2,
      marketSize: 0.4
    },
    marketSize: {
      revenue: 0.4,
      margins: 0.1,
      growthRate: 0.4
    }
  };

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
    const industryRisks = this.INDUSTRY_RISK_FACTORS[data.businessInfo.sector] || [];

    // Initialize Cholesky decomposition for correlated random variables
    const correlationMatrix = this.generateCorrelationMatrix(data.businessInfo.sector);
    const choleskyMatrix = this.computeCholeskyDecomposition(correlationMatrix);

    // Run simulations
    for (let i = 0; i < iterations; i++) {
      // Generate correlated random variables using Cholesky decomposition
      const correlatedRandoms = this.generateCorrelatedRandomVariables(choleskyMatrix);

      // Apply industry-specific risk factors
      const riskAdjustments = this.calculateRiskAdjustments(industryRisks);

      // Generate simulated data with correlations and risk factors
      const simulatedData = this.generateSimulatedData(data, correlatedRandoms, riskAdjustments);
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

    // Perform sensitivity analysis with improved correlation analysis
    const sensitivityAnalysis = this.performSensitivityAnalysis(
      sensitivityData,
      results
    );

    // Calculate risk analysis including industry-specific factors
    const riskAnalysis = {
      industryRisks: industryRisks.map(risk => ({
        factor: risk.name,
        impact: risk.baseImpact,
        probability: this.calculateRiskProbability(risk, results)
      })),
      correlationMatrix,
      volatilityMeasures: this.calculateVolatilityMeasures(results, sensitivityData)
    };

    return {
      expectedValue: this.calculateExpectedValue(results),
      confidenceIntervals: intervals,
      iterations,
      sensitivityAnalysis,
      riskAnalysis
    };
  }

  private static generateCorrelationMatrix(sector: string): Record<string, Record<string, number>> {
    // Start with base correlations
    const matrix = { ...this.BASE_CORRELATION_MATRIX };

    // Adjust correlations based on sector
    switch (sector) {
      case "technology":
        matrix.revenue.growthRate *= 1.2; // Tech companies have stronger revenue-growth correlation
        break;
      case "fintech":
        matrix.margins.marketSize *= 1.3; // Fintech margins more sensitive to market size
        break;
      case "healthtech":
        matrix.revenue.margins *= 0.8; // Healthcare has more stable margins
        break;
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

  private static calculateRiskAdjustments(industryRisks: Array<{ name: string; baseImpact: number; volatility: number }>): number {
    return industryRisks.reduce((total, risk) => {
      const randomFactor = this.generateNormalRandom() * risk.volatility;
      return total + (risk.baseImpact * (1 + randomFactor));
    }, 1);
  }

  private static generateSimulatedData(
    baseData: ValuationFormData,
    correlatedRandoms: number[],
    riskAdjustment: number
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

  private static calculateRiskProbability(
    risk: { name: string; baseImpact: number; volatility: number },
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

  private static calculateValuation(metrics: any): number {
    // Implement valuation calculation based on metrics
    const revenueMultiple = 5 + Math.random() * 3; // Example multiple range 5-8x
    return metrics.revenue.arr * revenueMultiple;
  }
}