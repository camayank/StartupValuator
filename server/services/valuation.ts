import type { ValuationFormData } from "../../client/src/lib/validations";

// Industry-specific multipliers and adjustments
const industryMultipliers = {
  SaaS: {
    baseMultiple: 10,
    adjustments: {
      revenueGrowth: (rate: number) => Math.min(2, 1 + rate / 100),
      margin: (margin: number) => 1 + margin / 200,
      arr: (arr: number) => Math.log10(arr) / 2,
      ltvCacRatio: (ratio: number) => Math.min(1.5, ratio / 3)
    }
  },
  Ecommerce: {
    baseMultiple: 4,
    adjustments: {
      grossMargin: (margin: number) => 1 + margin / 100,
      inventoryTurnover: (rate: number) => Math.min(1.3, rate / 12),
      customerRetention: (rate: number) => 1 + (rate - 50) / 100
    }
  },
  // Add more industries as needed
};

// Risk categories and their weights for Risk Factor Summation method
const riskFactors = {
  management: { weight: 0.2, max: 5 },
  stage: { weight: 0.15, max: 4 },
  legislation: { weight: 0.1, max: 4 },
  manufacturing: { weight: 0.1, max: 4 },
  sales: { weight: 0.15, max: 4 },
  funding: { weight: 0.15, max: 4 },
  competition: { weight: 0.15, max: 4 }
};

// Scorecard method comparison factors
const scorecardFactors = {
  marketSize: { weight: 0.25, benchmarkScore: 100 },
  technology: { weight: 0.15, benchmarkScore: 100 },
  teamExperience: { weight: 0.20, benchmarkScore: 100 },
  competitiveEnvironment: { weight: 0.15, benchmarkScore: 100 },
  marketingStrategy: { weight: 0.10, benchmarkScore: 100 },
  customerFeedback: { weight: 0.15, benchmarkScore: 100 }
};

// Base valuation for the Scorecard Method (average pre-money valuation for the industry)
const baseValuations = {
  SaaS: 4000000,
  Ecommerce: 2000000,
  Manufacturing: 3000000,
  // Add more industries as needed
};

export class ValuationCalculator {
  // Scorecard Method
  private calculateScorecardValuation(data: ValuationFormData): number {
    const industry = data.businessInfo.sector;
    const baseValuation = baseValuations[industry as keyof typeof baseValuations] || 2500000;

    let totalWeightedScore = 0;
    
    // Calculate weighted scores based on the data
    const marketScore = (data.marketData.tam / data.marketData.sam) * scorecardFactors.marketSize.weight;
    const techScore = (data.productDetails.maturity === "production" ? 1.2 : 0.8) * scorecardFactors.technology.weight;
    const teamScore = (data.financialData.revenue > 0 ? 1.1 : 0.9) * scorecardFactors.teamExperience.weight;
    
    totalWeightedScore = marketScore + techScore + teamScore;
    
    return baseValuation * totalWeightedScore;
  }

  // Risk Factor Summation Method
  private calculateRiskFactorValuation(data: ValuationFormData): number {
    const baseAmount = 500000; // Base amount for risk factor summation
    let riskSum = 0;

    // Calculate risk factors based on the data
    const risks = {
      management: data.financialData.revenue > 0 ? 2 : 4,
      stage: this.getStageRisk(data.productDetails.maturity),
      legislation: 2, // Default moderate risk
      manufacturing: 2,
      sales: this.getSalesRisk(data.financialData),
      funding: this.getFundingRisk(data.financialData.runway),
      competition: data.marketData.competitors?.length || 0 > 3 ? 4 : 2
    };

    // Sum up the weighted risks
    Object.entries(risks).forEach(([factor, value]) => {
      const riskFactor = riskFactors[factor as keyof typeof riskFactors];
      riskSum += (value / riskFactor.max) * riskFactor.weight;
    });

    return baseAmount * (1 + riskSum);
  }

  // Venture Capital Method
  private calculateVCValuation(data: ValuationFormData): number {
    const expectedExit = this.calculateExpectedExit(data);
    const requiredROI = data.valuationInputs.expectedROI || 10;
    const yearsToExit = 5; // Standard assumption

    // Calculate present value using required ROI
    const presentValue = expectedExit / Math.pow(1 + requiredROI, yearsToExit);
    
    return presentValue;
  }

  // Industry-specific adjustments
  private applyIndustryAdjustments(baseValuation: number, data: ValuationFormData): number {
    const industry = data.businessInfo.sector as keyof typeof industryMultipliers;
    const multipliers = industryMultipliers[industry];

    if (!multipliers) return baseValuation;

    let adjustedValuation = baseValuation;

    if (industry === 'SaaS') {
      const ltvCacRatio = data.financialData.ltv / data.financialData.cac;
      adjustedValuation *= multipliers.adjustments.ltvCacRatio(ltvCacRatio);
      adjustedValuation *= multipliers.adjustments.revenueGrowth(data.marketData.growthRate);
    } else if (industry === 'Ecommerce') {
      // Apply ecommerce-specific adjustments
      adjustedValuation *= multipliers.adjustments.grossMargin(30); // Example margin
    }

    return adjustedValuation;
  }

  // Helper methods
  private getStageRisk(stage: string): number {
    const stageRisks: Record<string, number> = {
      concept: 4,
      mvp: 3,
      beta: 2,
      production: 1
    };
    return stageRisks[stage] || 3;
  }

  private getSalesRisk(financialData: ValuationFormData['financialData']): number {
    if (financialData.revenue > 100000) return 1;
    if (financialData.revenue > 10000) return 2;
    if (financialData.revenue > 0) return 3;
    return 4;
  }

  private getFundingRisk(runway: number): number {
    if (runway > 18) return 1;
    if (runway > 12) return 2;
    if (runway > 6) return 3;
    return 4;
  }

  private calculateExpectedExit(data: ValuationFormData): number {
    const revenueMultiple = data.businessInfo.sector === 'SaaS' ? 10 : 5;
    const projectedRevenue = data.financialData.revenue * 
      Math.pow(1 + (data.marketData.growthRate / 100), 5);
    
    return projectedRevenue * revenueMultiple;
  }

  // Main valuation method
  public calculateValuation(data: ValuationFormData) {
    try {
      // Calculate valuations using different methods
      const scorecardValuation = this.calculateScorecardValuation(data);
      const riskFactorValuation = this.calculateRiskFactorValuation(data);
      const vcValuation = this.calculateVCValuation(data);

      // Apply industry-specific adjustments
      const adjustedScorecard = this.applyIndustryAdjustments(scorecardValuation, data);
      const adjustedRiskFactor = this.applyIndustryAdjustments(riskFactorValuation, data);
      const adjustedVC = this.applyIndustryAdjustments(vcValuation, data);

      // Calculate weighted average and confidence score
      const weights = {
        scorecard: 0.3,
        riskFactor: 0.3,
        vc: 0.4
      };

      const weightedAverage = 
        (adjustedScorecard * weights.scorecard) +
        (adjustedRiskFactor * weights.riskFactor) +
        (adjustedVC * weights.vc);

      // Calculate range and confidence
      const variance = Math.abs(
        Math.max(adjustedScorecard, adjustedRiskFactor, adjustedVC) -
        Math.min(adjustedScorecard, adjustedRiskFactor, adjustedVC)
      ) / weightedAverage;

      const confidence = Math.max(0.3, Math.min(0.9, 1 - variance));

      return {
        methodologies: {
          scorecard: adjustedScorecard,
          riskFactor: adjustedRiskFactor,
          vc: adjustedVC
        },
        valuation: weightedAverage,
        range: {
          low: weightedAverage * 0.8,
          high: weightedAverage * 1.2
        },
        confidence,
        factors: this.getValuationFactors(data)
      };
    } catch (error) {
      console.error('Valuation calculation error:', error);
      throw error;
    }
  }

  private getValuationFactors(data: ValuationFormData): string[] {
    const factors: string[] = [];

    // Market factors
    if (data.marketData.growthRate > 20) {
      factors.push('High market growth rate');
    }
    if (data.marketData.tam > 1000000000) {
      factors.push('Large total addressable market');
    }

    // Financial factors
    if (data.financialData.ltv > data.financialData.cac * 3) {
      factors.push('Strong LTV/CAC ratio');
    }
    if (data.financialData.revenue > 100000) {
      factors.push('Established revenue stream');
    }

    // Product factors
    if (data.productDetails.maturity === 'production') {
      factors.push('Production-ready product');
    }

    return factors;
  }
}
