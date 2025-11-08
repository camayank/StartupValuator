/**
 * DCF (Discounted Cash Flow) Valuation Service
 * For revenue-generating startups with financial history
 */

interface DCFInputs {
  historicalRevenue: number[];
  currentRevenue: number;
  currentEBITDA: number;
  projectionYears: number;
  discountRate: number;
  terminalGrowthRate: number;
  revenueGrowthRate?: number;
  ebitdaMargin?: number;
  taxRate?: number;
  capexPercentage?: number;
  nwcChangePercentage?: number;
}

interface DCFResult {
  method: 'dcf';
  enterpriseValue: number;
  equityValue: number;
  breakdown: {
    presentValueOfCashFlows: number;
    terminalValue: number;
    cashAdjustment: number;
    debtAdjustment: number;
  };
  projections: YearProjection[];
  assumptions: DCFAssumptions;
  confidence: number;
}

interface YearProjection {
  year: number;
  revenue: number;
  ebitda: number;
  fcf: number;
  presentValue: number;
}

interface DCFAssumptions {
  revenueGrowthRates: number[];
  ebitdaMarginRates: number[];
  taxRate: number;
  capexPercentage: number;
  nwcChangePercentage: number;
  depreciationPercentage: number;
}

export class DCFValuationService {

  /**
   * Calculate DCF valuation for revenue-generating startups
   */
  public calculate(inputs: DCFInputs): DCFResult {
    // Validate inputs
    this.validateInputs(inputs);

    // Derive default assumptions if not provided
    const assumptions = this.deriveAssumptions(inputs);

    // Generate financial projections
    const projections = this.generateProjections(inputs, assumptions);

    // Calculate present values
    const presentValues = projections.map(p => p.presentValue);
    const pvOfCashFlows = presentValues.reduce((sum, pv) => sum + pv, 0);

    // Calculate terminal value
    const lastYearFCF = projections[projections.length - 1].fcf;
    const terminalValue = this.calculateTerminalValue(
      lastYearFCF,
      inputs.terminalGrowthRate,
      inputs.discountRate,
      inputs.projectionYears
    );

    // Enterprise value = PV of cash flows + PV of terminal value
    const enterpriseValue = pvOfCashFlows + terminalValue;

    // For simplicity, assume equity value ≈ enterprise value
    // In practice, would adjust for cash and debt from balance sheet
    const equityValue = enterpriseValue;

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(inputs, projections);

    return {
      method: 'dcf',
      enterpriseValue,
      equityValue,
      breakdown: {
        presentValueOfCashFlows: pvOfCashFlows,
        terminalValue,
        cashAdjustment: 0,
        debtAdjustment: 0
      },
      projections,
      assumptions,
      confidence
    };
  }

  private validateInputs(inputs: DCFInputs): void {
    if (inputs.currentRevenue <= 0) {
      throw new Error('DCF method requires positive revenue');
    }
    if (inputs.discountRate < 10 || inputs.discountRate > 50) {
      throw new Error('Discount rate must be between 10% and 50%');
    }
    if (inputs.terminalGrowthRate < 0 || inputs.terminalGrowthRate > 10) {
      throw new Error('Terminal growth rate must be between 0% and 10%');
    }
  }

  private deriveAssumptions(inputs: DCFInputs): DCFAssumptions {
    // Calculate historical growth rate if we have history
    let baseGrowthRate = inputs.revenueGrowthRate || 30; // Default 30% for startups

    if (inputs.historicalRevenue && inputs.historicalRevenue.length >= 2) {
      const recentGrowth = ((inputs.currentRevenue - inputs.historicalRevenue[inputs.historicalRevenue.length - 1]) /
                            inputs.historicalRevenue[inputs.historicalRevenue.length - 1]) * 100;
      baseGrowthRate = Math.max(10, Math.min(recentGrowth, 100)); // Cap between 10-100%
    }

    // Growth rates decline over time (typical for startups)
    const revenueGrowthRates = Array.from({ length: inputs.projectionYears }, (_, i) => {
      const declineRate = Math.pow(0.85, i); // 15% decline each year
      return Math.max(baseGrowthRate * declineRate, inputs.terminalGrowthRate);
    });

    // EBITDA margin improves as company scales
    const currentMargin = inputs.ebitdaMargin || (inputs.currentEBITDA / inputs.currentRevenue) * 100;
    const targetMargin = 25; // Target 25% EBITDA margin at maturity
    const ebitdaMarginRates = Array.from({ length: inputs.projectionYears }, (_, i) => {
      const progress = (i + 1) / inputs.projectionYears;
      return currentMargin + (targetMargin - currentMargin) * progress;
    });

    return {
      revenueGrowthRates,
      ebitdaMarginRates,
      taxRate: inputs.taxRate || 25, // India corporate tax
      capexPercentage: inputs.capexPercentage || 5,
      nwcChangePercentage: inputs.nwcChangePercentage || 5,
      depreciationPercentage: 3
    };
  }

  private generateProjections(inputs: DCFInputs, assumptions: DCFAssumptions): YearProjection[] {
    const projections: YearProjection[] = [];
    let currentRevenue = inputs.currentRevenue;

    for (let year = 1; year <= inputs.projectionYears; year++) {
      // Project revenue
      const growthRate = assumptions.revenueGrowthRates[year - 1];
      const revenue = currentRevenue * (1 + growthRate / 100);

      // Project EBITDA
      const ebitdaMargin = assumptions.ebitdaMarginRates[year - 1];
      const ebitda = revenue * (ebitdaMargin / 100);

      // Calculate Free Cash Flow
      const ebit = ebitda; // Simplification: EBIT ≈ EBITDA for startups
      const nopat = ebit * (1 - assumptions.taxRate / 100);
      const depreciation = revenue * (assumptions.depreciationPercentage / 100);
      const capex = revenue * (assumptions.capexPercentage / 100);
      const nwcChange = revenue * (assumptions.nwcChangePercentage / 100);

      const fcf = nopat + depreciation - capex - nwcChange;

      // Calculate present value
      const presentValue = fcf / Math.pow(1 + inputs.discountRate / 100, year);

      projections.push({
        year,
        revenue,
        ebitda,
        fcf,
        presentValue
      });

      currentRevenue = revenue;
    }

    return projections;
  }

  private calculateTerminalValue(
    lastYearFCF: number,
    terminalGrowthRate: number,
    discountRate: number,
    projectionYears: number
  ): number {
    // Gordon Growth Model
    const terminalValue = (lastYearFCF * (1 + terminalGrowthRate / 100)) /
                          ((discountRate - terminalGrowthRate) / 100);

    // Discount to present value
    const presentValue = terminalValue / Math.pow(1 + discountRate / 100, projectionYears);

    return presentValue;
  }

  private calculateConfidence(inputs: DCFInputs, projections: YearProjection[]): number {
    let confidence = 70; // Base confidence

    // Increase confidence if we have historical data
    if (inputs.historicalRevenue && inputs.historicalRevenue.length >= 3) {
      confidence += 10;
    }

    // Increase confidence if current EBITDA is positive
    if (inputs.currentEBITDA > 0) {
      confidence += 10;
    }

    // Decrease confidence if growth rates are very high (unrealistic)
    const avgGrowthRate = projections.slice(0, 3).reduce((sum, p, i) => {
      if (i === 0) return p.revenue / inputs.currentRevenue - 1;
      return sum + (p.revenue / projections[i-1].revenue - 1);
    }, 0) / 3;

    if (avgGrowthRate > 1.0) { // >100% avg growth
      confidence -= 10;
    }

    return Math.max(0, Math.min(100, confidence));
  }
}
