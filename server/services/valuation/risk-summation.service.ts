/**
 * Risk Factor Summation Method
 * Adjusts base valuation by assessing various risk factors
 */

interface RiskSummationInputs {
  baseValuation: number;
  riskFactors: {
    managementRisk: number; // 1-5 scale (3 is neutral)
    stageRisk: number;
    legislationRisk: number;
    manufacturingRisk: number;
    salesMarketingRisk: number;
    fundingRisk: number;
    competitionRisk: number;
    technologyRisk: number;
    litigationRisk: number;
    reputationRisk: number;
  };
}

interface RiskSummationResult {
  method: 'risk_summation';
  equityValue: number;
  breakdown: {
    baseValuation: number;
    totalAdjustment: number;
    riskDetails: RiskDetail[];
    overallRiskLevel: 'low' | 'medium' | 'high';
  };
  confidence: number;
  reasoning: string[];
}

interface RiskDetail {
  riskType: string;
  riskLevel: number;
  adjustment: number;
  impact: 'positive' | 'neutral' | 'negative';
  description: string;
}

export class RiskSummationService {
  // Adjustment per risk level in INR (adapted for India)
  private readonly ADJUSTMENT_PER_LEVEL = 125000; // ₹1.25 lakhs per level

  // Weight/importance of each risk factor
  private readonly RISK_WEIGHTS = {
    managementRisk: 1.5, // Most important
    stageRisk: 1.3,
    legislationRisk: 1.0,
    manufacturingRisk: 0.8,
    salesMarketingRisk: 1.2,
    fundingRisk: 1.0,
    competitionRisk: 1.1,
    technologyRisk: 1.0,
    litigationRisk: 0.9,
    reputationRisk: 0.8
  };

  /**
   * Calculate Risk Factor Summation valuation
   * Risk level: 1 (very low risk) to 5 (very high risk)
   * 3 is neutral (no adjustment)
   */
  public calculate(inputs: RiskSummationInputs): RiskSummationResult {
    const riskDetails: RiskDetail[] = [];
    const reasoning: string[] = [];
    let totalAdjustment = 0;

    reasoning.push(`Base valuation: ₹${(inputs.baseValuation / 10000000).toFixed(1)} Cr`);
    reasoning.push(`\nRisk Assessment (1=Very Low Risk, 3=Neutral, 5=Very High Risk):`);

    // Assess each risk factor
    for (const [riskType, riskLevel] of Object.entries(inputs.riskFactors)) {
      // Risk level 3 is neutral (no adjustment)
      // <3 adds value (lower risk), >3 reduces value (higher risk)
      const levelAdjustment = (3 - riskLevel);

      // Apply weight to the adjustment
      const weight = this.RISK_WEIGHTS[riskType as keyof typeof this.RISK_WEIGHTS];
      const adjustment = levelAdjustment * this.ADJUSTMENT_PER_LEVEL * weight;

      totalAdjustment += adjustment;

      const impact = riskLevel < 3 ? 'positive' : riskLevel > 3 ? 'negative' : 'neutral';
      const description = this.getRiskDescription(riskType, riskLevel);

      riskDetails.push({
        riskType: this.formatRiskName(riskType),
        riskLevel,
        adjustment,
        impact,
        description
      });

      const sign = adjustment >= 0 ? '+' : '';
      reasoning.push(
        `  ${this.formatRiskName(riskType)}: ${riskLevel}/5 → ${sign}₹${(adjustment / 100000).toFixed(1)}L (${impact})`
      );
    }

    const adjustedValuation = Math.max(0, inputs.baseValuation + totalAdjustment);

    reasoning.push(`\nTotal risk adjustment: ${totalAdjustment >= 0 ? '+' : ''}₹${(totalAdjustment / 10000000).toFixed(2)} Cr`);
    reasoning.push(`Final valuation: ₹${(adjustedValuation / 10000000).toFixed(1)} Cr`);

    // Determine overall risk level
    const avgRiskLevel = Object.values(inputs.riskFactors).reduce((sum, r) => sum + r, 0) /
                         Object.values(inputs.riskFactors).length;
    const overallRiskLevel = avgRiskLevel <= 2.5 ? 'low' : avgRiskLevel <= 3.5 ? 'medium' : 'high';

    // Calculate confidence
    const confidence = this.calculateConfidence(inputs, totalAdjustment);

    return {
      method: 'risk_summation',
      equityValue: Math.round(adjustedValuation),
      breakdown: {
        baseValuation: inputs.baseValuation,
        totalAdjustment,
        riskDetails,
        overallRiskLevel
      },
      confidence,
      reasoning
    };
  }

  private formatRiskName(risk: string): string {
    const nameMap: Record<string, string> = {
      managementRisk: 'Management/Team Risk',
      stageRisk: 'Business Stage Risk',
      legislationRisk: 'Legislative/Political Risk',
      manufacturingRisk: 'Operations/Manufacturing Risk',
      salesMarketingRisk: 'Sales/Marketing Risk',
      fundingRisk: 'Funding/Capital Risk',
      competitionRisk: 'Competition Risk',
      technologyRisk: 'Technology Risk',
      litigationRisk: 'Litigation Risk',
      reputationRisk: 'Reputation Risk'
    };
    return nameMap[risk] || risk;
  }

  private getRiskDescription(riskType: string, level: number): string {
    if (level === 3) return 'Neutral - typical for industry';
    if (level < 3) return 'Lower than average - competitive advantage';
    return 'Higher than average - needs mitigation';
  }

  private calculateConfidence(inputs: RiskSummationInputs, adjustment: number): number {
    let confidence = 70; // Base confidence

    // Reduce confidence if adjustment is too extreme relative to base
    const adjustmentPercentage = Math.abs(adjustment / inputs.baseValuation);
    if (adjustmentPercentage > 0.5) {
      confidence -= 15;
    }

    // Increase confidence if risk assessment is comprehensive
    const numFactors = Object.keys(inputs.riskFactors).length;
    if (numFactors >= 8) {
      confidence += 10;
    }

    // Reduce confidence if all risks are at extremes (1 or 5)
    const extremeRisks = Object.values(inputs.riskFactors).filter(r => r === 1 || r === 5).length;
    if (extremeRisks > numFactors * 0.7) {
      confidence -= 10;
    }

    return Math.max(0, Math.min(100, confidence));
  }
}
