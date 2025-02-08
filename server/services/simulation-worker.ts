import { expose } from 'comlink';
import { WASI } from '@wasmer/wasi';

// Initialize WASI for WebAssembly
const wasi = new WASI({
  args: [],
  env: {},
  bindings: {
    ...WASI.defaultBindings
  }
});

interface BatchResult {
  results: number[];
  impacts: Record<string, number[]>;
}

interface SimulationParams {
  baseValue: number;
  variables: {
    revenue: { mean: number; stdDev: number };
    margins: { mean: number; stdDev: number };
    growthRate: { mean: number; stdDev: number };
    marketSize: { mean: number; stdDev: number };
    discount: { mean: number; stdDev: number };
  };
}

// Worker API
const workerApi = {
  async runBatches(
    params: SimulationParams,
    numBatches: number,
    batchSize: number
  ): Promise<BatchResult> {
    const results: number[] = [];
    const impacts: Record<string, number[]> = {};

    for (let batch = 0; batch < numBatches; batch++) {
      for (let i = 0; i < batchSize; i++) {
        const iterationResult = this.runIteration(params);
        results.push(iterationResult.value);
        
        for (const [variable, impact] of Object.entries(iterationResult.impacts)) {
          if (!impacts[variable]) {
            impacts[variable] = [];
          }
          impacts[variable].push(impact);
        }
      }
    }

    return { results, impacts };
  },

  runIteration(params: SimulationParams): { value: number; impacts: Record<string, number> } {
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
  },

  generateNormal(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + stdDev * z;
  },

  calculateIterationValue(
    baseValue: number,
    variables: Record<string, number>
  ): number {
    const revenueMultiple = (1 + variables.growthRate / 100) * (1 + variables.margins / 100);
    const marketFactor = Math.min(variables.revenue / variables.marketSize, 1);
    const discountFactor = 1 / (1 + variables.discount / 100);

    return baseValue * revenueMultiple * marketFactor * discountFactor;
  }
};

// Expose the worker API
expose(workerApi);
