import { Decimal } from 'decimal.js';
import type { ValuationFormData } from "../../client/src/lib/validations";

interface SimulationParams {
  baseValue: number;
  iterations: number;
  variables: {
    revenue: { mean: number; stdDev: number };
    margins: { mean: number; stdDev: number };
    growthRate: { mean: number; stdDev: number };
    marketSize: { mean: number; stdDev: number };
    discount: { mean: number; stdDev: number };
  };
}

interface SimulationResult {
  valuationDistribution: {
    min: number;
    max: number;
    mean: number;
    median: number;
    standardDeviation: number;
    confidence95: { lower: number; upper: number };
  };
  sensitivityAnalysis: Array<{
    variable: string;
    impact: number;
    correlation: number;
  }>;
  scenarios: Array<{
    probability: number;
    value: number;
    description: string;
    keyFactors: Record<string, number>;
  }>;
  riskMetrics: {
    valueAtRisk: number;
    expectedShortfall: number;
    probabilityOfLoss: number;
  };
}

export class MonteCarloService {
  private readonly DEFAULT_ITERATIONS = 10000;

  async runSimulation(
    data: ValuationFormData,
    baseValue: number,
    customParams?: Partial<SimulationParams>
  ): Promise<SimulationResult> {
    try {
      const params = this.buildSimulationParams(data, baseValue, customParams);
      const results = new Array<number>(params.iterations);
      const variableImpacts = new Map<string, number[]>();

      // Run iterations
      for (let i = 0; i < params.iterations; i++) {
        const iterationResults = this.runIteration(params);
        results[i] = iterationResults.value;
        
        // Track variable impacts
        for (const [variable, impact] of Object.entries(iterationResults.impacts)) {
          if (!variableImpacts.has(variable)) {
            variableImpacts.set(variable, []);
          }
          variableImpacts.get(variable)!.push(impact);
        }
      }

      // Calculate distribution metrics
      const sortedResults = results.sort((a, b) => a - b);
      const mean = this.calculateMean(results);
      const stdDev = this.calculateStandardDeviation(results, mean);

      // Calculate sensitivity analysis
      const sensitivity = this.calculateSensitivity(variableImpacts, results);

      // Generate scenarios
      const scenarios = this.generateScenarios(sortedResults, variableImpacts);

      // Calculate risk metrics
      const riskMetrics = this.calculateRiskMetrics(sortedResults, baseValue);

      return {
        valuationDistribution: {
          min: sortedResults[0],
          max: sortedResults[sortedResults.length - 1],
          mean,
          median: this.calculateMedian(sortedResults),
          standardDeviation: stdDev,
          confidence95: {
            lower: sortedResults[Math.floor(params.iterations * 0.025)],
            upper: sortedResults[Math.floor(params.iterations * 0.975)]
          }
        },
        sensitivityAnalysis: sensitivity,
        scenarios,
        riskMetrics
      };
    } catch (error) {
      console.error('Monte Carlo simulation error:', error);
      throw new Error('Failed to run Monte Carlo simulation');
    }
  }

  private buildSimulationParams(
    data: ValuationFormData,
    baseValue: number,
    customParams?: Partial<SimulationParams>
  ): SimulationParams {
    const revenue = data.businessInfo.financials?.revenue || 0;
    const margins = data.businessInfo.financials?.margins || 0;
    const growthRate = data.businessInfo.financials?.growthRate || 0;

    return {
      baseValue,
      iterations: customParams?.iterations || this.DEFAULT_ITERATIONS,
      variables: {
        revenue: {
          mean: revenue,
          stdDev: revenue * 0.2
        },
        margins: {
          mean: margins,
          stdDev: 5
        },
        growthRate: {
          mean: growthRate,
          stdDev: 3
        },
        marketSize: {
          mean: baseValue * 10,
          stdDev: baseValue * 2
        },
        discount: {
          mean: 15,
          stdDev: 2
        },
        ...customParams?.variables
      }
    };
  }

  private runIteration(params: SimulationParams): { value: number; impacts: Record<string, number> } {
    const impacts: Record<string, number> = {};
    
    // Generate random variables using Box-Muller transform
    const revenue = this.generateNormal(params.variables.revenue.mean, params.variables.revenue.stdDev);
    impacts.revenue = revenue - params.variables.revenue.mean;

    const margins = this.generateNormal(params.variables.margins.mean, params.variables.margins.stdDev);
    impacts.margins = margins - params.variables.margins.mean;

    const growthRate = this.generateNormal(params.variables.growthRate.mean, params.variables.growthRate.stdDev);
    impacts.growthRate = growthRate - params.variables.growthRate.mean;

    const marketSize = this.generateNormal(params.variables.marketSize.mean, params.variables.marketSize.stdDev);
    impacts.marketSize = marketSize - params.variables.marketSize.mean;

    const discount = this.generateNormal(params.variables.discount.mean, params.variables.discount.stdDev);
    impacts.discount = discount - params.variables.discount.mean;

    // Calculate iteration value
    const value = this.calculateIterationValue(params.baseValue, {
      revenue,
      margins,
      growthRate,
      marketSize,
      discount
    });

    return { value, impacts };
  }

  private generateNormal(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + stdDev * z;
  }

  private calculateIterationValue(
    baseValue: number,
    variables: Record<string, number>
  ): number {
    const revenueMultiple = (1 + variables.growthRate / 100) * (1 + variables.margins / 100);
    const marketFactor = Math.min(variables.revenue / variables.marketSize, 1);
    const discountFactor = 1 / (1 + variables.discount / 100);

    return baseValue * revenueMultiple * marketFactor * discountFactor;
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateMedian(sortedValues: number[]): number {
    const mid = Math.floor(sortedValues.length / 2);
    return sortedValues.length % 2 !== 0
      ? sortedValues[mid]
      : (sortedValues[mid - 1] + sortedValues[mid]) / 2;
  }

  private calculateStandardDeviation(values: number[], mean: number): number {
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return Math.sqrt(this.calculateMean(squaredDiffs));
  }

  private calculateSensitivity(
    variableImpacts: Map<string, number[]>,
    results: number[]
  ): Array<{ variable: string; impact: number; correlation: number }> {
    const resultsMean = this.calculateMean(results);
    const resultsStdDev = this.calculateStandardDeviation(results, resultsMean);

    return Array.from(variableImpacts.entries()).map(([variable, impacts]) => {
      const impactsMean = this.calculateMean(impacts);
      const impactsStdDev = this.calculateStandardDeviation(impacts, impactsMean);
      
      // Calculate correlation coefficient
      const correlation = this.calculateCorrelation(impacts, results);
      
      return {
        variable,
        impact: (impactsStdDev / resultsStdDev) * correlation,
        correlation
      };
    }).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  private calculateCorrelation(array1: number[], array2: number[]): number {
    const mean1 = this.calculateMean(array1);
    const mean2 = this.calculateMean(array2);
    
    const diffProd = array1.reduce((sum, value, i) => 
      sum + (value - mean1) * (array2[i] - mean2), 0);
    
    const sqDiff1 = array1.reduce((sum, value) => 
      sum + Math.pow(value - mean1, 2), 0);
    const sqDiff2 = array2.reduce((sum, value) => 
      sum + Math.pow(value - mean2, 2), 0);
    
    return diffProd / Math.sqrt(sqDiff1 * sqDiff2);
  }

  private generateScenarios(
    sortedResults: number[],
    variableImpacts: Map<string, number[]>
  ): Array<{
    probability: number;
    value: number;
    description: string;
    keyFactors: Record<string, number>;
  }> {
    const scenarios = [];
    const n = sortedResults.length;

    // Worst case (5th percentile)
    const worstIndex = Math.floor(n * 0.05);
    scenarios.push(this.createScenario(
      "Pessimistic",
      sortedResults[worstIndex],
      0.05,
      variableImpacts,
      worstIndex
    ));

    // Base case (50th percentile)
    const baseIndex = Math.floor(n * 0.5);
    scenarios.push(this.createScenario(
      "Base",
      sortedResults[baseIndex],
      0.5,
      variableImpacts,
      baseIndex
    ));

    // Best case (95th percentile)
    const bestIndex = Math.floor(n * 0.95);
    scenarios.push(this.createScenario(
      "Optimistic",
      sortedResults[bestIndex],
      0.95,
      variableImpacts,
      bestIndex
    ));

    return scenarios;
  }

  private createScenario(
    type: string,
    value: number,
    percentile: number,
    variableImpacts: Map<string, number[]>,
    index: number
  ) {
    const keyFactors: Record<string, number> = {};
    
    for (const [variable, impacts] of variableImpacts.entries()) {
      keyFactors[variable] = impacts[index];
    }

    return {
      probability: 1 - percentile,
      value,
      description: `${type} scenario based on ${percentile * 100}th percentile`,
      keyFactors
    };
  }

  private calculateRiskMetrics(sortedResults: number[], baseValue: number) {
    const n = sortedResults.length;
    
    // Calculate Value at Risk (VaR) at 95% confidence
    const varIndex = Math.floor(n * 0.05);
    const valueAtRisk = Math.max(0, baseValue - sortedResults[varIndex]);

    // Calculate Expected Shortfall (ES) / Conditional VaR
    const expectedShortfall = sortedResults
      .slice(0, varIndex)
      .reduce((sum, value) => sum + (baseValue - value), 0) / varIndex;

    // Calculate probability of loss (value below base)
    const probabilityOfLoss = sortedResults.filter(value => value < baseValue).length / n;

    return {
      valueAtRisk,
      expectedShortfall,
      probabilityOfLoss
    };
  }
}

export const monteCarloService = new MonteCarloService();
