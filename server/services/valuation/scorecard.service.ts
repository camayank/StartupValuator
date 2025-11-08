/**
 * Scorecard Method Valuation Service
 * Compares startup to median pre-money valuations in the region/sector
 */

interface ScorecardInputs {
  baselineValuation: number; // Average valuation for similar startups
  industry: string;
  stage: string;
  factors: {
    strengthOfTeam: number; // 0-10 rating
    sizeOfOpportunity: number; // 0-10 rating
    productTechnology: number; // 0-10 rating
    competitiveEnvironment: number; // 0-10 rating
    marketingChannels: number; // 0-10 rating
    needForFunding: number; // 0-10 rating (higher is better - less need)
    partnerships: number; // 0-10 rating
  };
}

interface ScorecardResult {
  method: 'scorecard';
  equityValue: number;
  breakdown: {
    baselineValuation: number;
    adjustmentFactor: number;
    adjustmentPercentage: number;
    factorContributions: FactorContribution[];
  };
  confidence: number;
  reasoning: string[];
}

interface FactorContribution {
  factor: string;
  rating: number;
  weight: number;
  adjustment: number;
  contribution: number;
}

export class ScorecardValuationService {
  // Industry-standard weights (sum to 100%)
  private readonly WEIGHTS = {
    strengthOfTeam: 0.30, // 30% - most important
    sizeOfOpportunity: 0.25, // 25%
    productTechnology: 0.15, // 15%
    competitiveEnvironment: 0.10, // 10%
    marketingChannels: 0.10, // 10%
    needForFunding: 0.05, // 5%
    partnerships: 0.05, // 5%
  };

  /**
   * Calculate Scorecard valuation
   * Rating of 5 is average (100%), 10 is excellent (200%), 0 is poor (0%)
   */
  public calculate(inputs: ScorecardInputs): ScorecardResult {
    const factorContributions: FactorContribution[] = [];
    const reasoning: string[] = [];
    let totalAdjustment = 0;

    reasoning.push(`Baseline valuation for ${inputs.industry} at ${inputs.stage}: ₹${(inputs.baselineValuation / 10000000).toFixed(1)} Cr`);

    // Calculate adjustment for each factor
    for (const [factorName, rating] of Object.entries(inputs.factors)) {
      const weight = this.WEIGHTS[factorName as keyof typeof this.WEIGHTS];

      // Convert 0-10 rating to multiplier: 5 is 1.0x (average), 10 is 2.0x, 0 is 0x
      const multiplier = rating / 5;

      // Adjustment: -1.0 to +1.0 (where 0 is average)
      const adjustment = (multiplier - 1.0);

      // Weighted contribution to total
      const contribution = adjustment * weight;
      totalAdjustment += contribution;

      factorContributions.push({
        factor: this.formatFactorName(factorName),
        rating,
        weight,
        adjustment,
        contribution
      });

      const impact = contribution >= 0 ? 'positive' : 'negative';
      const sign = contribution >= 0 ? '+' : '';
      reasoning.push(
        `${this.formatFactorName(factorName)} (${rating}/10, ${(weight * 100).toFixed(0)}% weight): ${sign}${(contribution * 100).toFixed(1)}% ${impact} adjustment`
      );
    }

    // Apply adjustment to baseline
    const adjustedValuation = inputs.baselineValuation * (1 + totalAdjustment);

    reasoning.push(`\nTotal adjustment: ${(totalAdjustment * 100).toFixed(1)}%`);
    reasoning.push(`Final valuation: ₹${(inputs.baselineValuation / 10000000).toFixed(1)} Cr × ${(1 + totalAdjustment).toFixed(2)} = ₹${(adjustedValuation / 10000000).toFixed(1)} Cr`);

    // Calculate confidence
    const confidence = this.calculateConfidence(inputs, totalAdjustment);

    return {
      method: 'scorecard',
      equityValue: Math.round(adjustedValuation),
      breakdown: {
        baselineValuation: inputs.baselineValuation,
        adjustmentFactor: totalAdjustment,
        adjustmentPercentage: totalAdjustment * 100,
        factorContributions
      },
      confidence,
      reasoning
    };
  }

  private formatFactorName(factor: string): string {
    const nameMap: Record<string, string> = {
      strengthOfTeam: 'Team Strength',
      sizeOfOpportunity: 'Market Opportunity',
      productTechnology: 'Product/Technology',
      competitiveEnvironment: 'Competitive Position',
      marketingChannels: 'Marketing/Sales Channels',
      needForFunding: 'Capital Efficiency',
      partnerships: 'Strategic Partnerships'
    };
    return nameMap[factor] || factor;
  }

  private calculateConfidence(inputs: ScorecardInputs, adjustment: number): number {
    let confidence = 75; // Base confidence

    // Reduce confidence if adjustment is extreme (>±50%)
    if (Math.abs(adjustment) > 0.5) {
      confidence -= 15;
    }

    // Reduce confidence if we don't have a good baseline
    if (inputs.baselineValuation === 0) {
      confidence -= 20;
    }

    // Increase confidence if factors are balanced (not all extreme)
    const ratings = Object.values(inputs.factors);
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / ratings.length;

    if (variance < 4) { // Low variance = balanced assessment
      confidence += 10;
    }

    return Math.max(0, Math.min(100, confidence));
  }
}
