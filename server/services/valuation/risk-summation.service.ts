import { RiskFactorInputs, ValuationResult } from './types';

/**
 * Risk Factor Summation Method
 * Adjusts base valuation based on various risk factors
 * Each risk factor rated 1-5 (3 is neutral, <3 reduces risk, >3 increases risk)
 */

const ADJUSTMENT_PER_RISK_LEVEL = 125000; // ₹1.25 lakhs per risk level

const RISK_FACTOR_DESCRIPTIONS: Record<string, { name: string; description: string }> = {
  managementRisk: {
    name: 'Management Risk',
    description: 'Quality and experience of the management team',
  },
  stageOfBusiness: {
    name: 'Business Stage Risk',
    description: 'Maturity level and development stage of the business',
  },
  legislationRisk: {
    name: 'Legislative/Political Risk',
    description: 'Exposure to regulatory changes and political instability',
  },
  manufacturingRisk: {
    name: 'Manufacturing Risk',
    description: 'Production and operational execution risks',
  },
  salesMarketingRisk: {
    name: 'Sales & Marketing Risk',
    description: 'Ability to acquire and retain customers',
  },
  fundingRisk: {
    name: 'Funding/Capital Risk',
    description: 'Access to capital and financial sustainability',
  },
  competitionRisk: {
    name: 'Competition Risk',
    description: 'Competitive intensity and market saturation',
  },
  technologyRisk: {
    name: 'Technology Risk',
    description: 'Technical feasibility and obsolescence risks',
  },
  litigationRisk: {
    name: 'Litigation Risk',
    description: 'Legal disputes and IP-related risks',
  },
  internationalRisk: {
    name: 'International Risk',
    description: 'Global expansion and cross-border operational risks',
  },
  reputationRisk: {
    name: 'Reputation Risk',
    description: 'Brand perception and public relations risks',
  },
  potentialLucrative: {
    name: 'Lucrative Exit Potential',
    description: 'Likelihood of successful exit or high returns',
  },
};

/**
 * Calculate Risk Factor Summation valuation
 */
export async function calculateRiskSummationValuation(
  inputs: RiskFactorInputs
): Promise<ValuationResult> {
  // Validation
  validateInputs(inputs);

  let totalAdjustment = 0;
  const riskDetails: Array<{
    riskType: string;
    riskName: string;
    riskLevel: number;
    adjustment: number;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }> = [];

  // Calculate adjustment for each risk factor
  for (const [riskType, riskLevel] of Object.entries(inputs.riskFactors)) {
    // Risk level 3 is neutral, <3 is positive (lower risk), >3 is negative (higher risk)
    const adjustment = (3 - riskLevel) * ADJUSTMENT_PER_RISK_LEVEL;
    totalAdjustment += adjustment;

    const impact: 'positive' | 'negative' | 'neutral' =
      riskLevel < 3 ? 'positive' : riskLevel > 3 ? 'negative' : 'neutral';

    const info = RISK_FACTOR_DESCRIPTIONS[riskType] || {
      name: riskType,
      description: '',
    };

    riskDetails.push({
      riskType,
      riskName: info.name,
      riskLevel,
      adjustment,
      impact,
      description: info.description,
    });
  }

  // Sort by impact (most negative first, then most positive)
  riskDetails.sort((a, b) => a.adjustment - b.adjustment);

  const adjustedValuation = Math.max(0, inputs.baseValuation + totalAdjustment);

  // Calculate confidence score
  const confidence = calculateConfidence(inputs, riskDetails);

  // Generate risk mitigation recommendations
  const recommendations = generateRecommendations(riskDetails);

  // Calculate overall risk profile
  const riskProfile = calculateRiskProfile(riskDetails);

  return {
    method: 'risk_summation',
    equityValue: adjustedValuation,
    breakdown: {
      baseValuation: inputs.baseValuation,
      totalAdjustment,
      adjustmentPercentage: (totalAdjustment / inputs.baseValuation) * 100,
      adjustedValuation,
      riskDetails,
      recommendations,
      riskProfile,
    },
    confidence,
  };
}

/**
 * Validate inputs
 */
function validateInputs(inputs: RiskFactorInputs): void {
  if (inputs.baseValuation <= 0) {
    throw new Error('Base valuation must be greater than 0');
  }

  for (const [riskType, riskLevel] of Object.entries(inputs.riskFactors)) {
    if (riskLevel < 1 || riskLevel > 5) {
      throw new Error(`${riskType} must be between 1 and 5`);
    }
  }
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  inputs: RiskFactorInputs,
  riskDetails: any[]
): number {
  let confidence = 70; // Base confidence

  // Count high-risk factors (level 4 or 5)
  const highRiskCount = riskDetails.filter(r => r.riskLevel >= 4).length;

  // Count low-risk factors (level 1 or 2)
  const lowRiskCount = riskDetails.filter(r => r.riskLevel <= 2).length;

  // Adjust confidence based on risk distribution
  if (highRiskCount > 6) {
    confidence -= 15; // Many high risks
  } else if (highRiskCount > 3) {
    confidence -= 10;
  }

  if (lowRiskCount > 6) {
    confidence += 15; // Many low risks
  } else if (lowRiskCount > 3) {
    confidence += 10;
  }

  // Check for extreme adjustment
  const adjustmentPercentage = Math.abs(
    (inputs.baseValuation - (inputs.baseValuation + riskDetails.reduce((sum, r) => sum + r.adjustment, 0))) /
      inputs.baseValuation
  );

  if (adjustmentPercentage > 0.5) {
    confidence -= 10; // Extreme adjustment indicates outlier
  }

  return Math.max(0, Math.min(100, confidence));
}

/**
 * Generate risk mitigation recommendations
 */
function generateRecommendations(riskDetails: any[]): string[] {
  const recommendations: string[] = [];

  // Focus on highest risks (level 4-5)
  const highRisks = riskDetails.filter(r => r.riskLevel >= 4);

  for (const risk of highRisks) {
    let recommendation = '';

    switch (risk.riskType) {
      case 'managementRisk':
        recommendation = 'Strengthen management team by hiring experienced professionals or adding advisory board members with proven track records.';
        break;
      case 'competitionRisk':
        recommendation = 'Develop unique competitive advantages through IP, exclusive partnerships, or proprietary technology. Focus on building a strong moat.';
        break;
      case 'technologyRisk':
        recommendation = 'Validate technical feasibility through prototypes and pilot projects. Consider engaging technical advisors or consultants.';
        break;
      case 'fundingRisk':
        recommendation = 'Develop multiple funding sources and maintain longer runway. Consider revenue-based financing or strategic partnerships.';
        break;
      case 'salesMarketingRisk':
        recommendation = 'Establish proven customer acquisition channels. Focus on early traction and demonstrate product-market fit through pilot customers.';
        break;
      case 'legislationRisk':
        recommendation = 'Engage legal counsel to navigate regulatory landscape. Build compliance into product design from the start.';
        break;
      case 'manufacturingRisk':
        recommendation = 'Secure reliable suppliers and consider vertical integration for critical components. Implement quality control processes.';
        break;
      case 'litigationRisk':
        recommendation = 'Conduct IP clearance searches and secure necessary patents/trademarks. Maintain proper corporate governance and documentation.';
        break;
      case 'internationalRisk':
        recommendation = 'Start with domestic market before international expansion. Partner with local entities for market entry.';
        break;
      case 'reputationRisk':
        recommendation = 'Build strong brand through consistent quality and customer service. Monitor online reputation and engage with community.';
        break;
      default:
        recommendation = `Address ${risk.riskName} by developing specific mitigation strategies and contingency plans.`;
    }

    recommendations.push(recommendation);
  }

  // Highlight strengths (level 1-2)
  const strengths = riskDetails.filter(r => r.riskLevel <= 2);
  if (strengths.length > 0) {
    recommendations.push(
      `Strengths to highlight: ${strengths.map(s => s.riskName).join(', ')}. These are competitive advantages that should be emphasized to investors.`
    );
  }

  return recommendations;
}

/**
 * Calculate overall risk profile
 */
function calculateRiskProfile(riskDetails: any[]): {
  overallRiskLevel: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';
  criticalRisks: string[];
  managedRisks: string[];
  riskScore: number; // 0-100, lower is better
} {
  // Calculate average risk level
  const averageRisk =
    riskDetails.reduce((sum, r) => sum + r.riskLevel, 0) / riskDetails.length;

  // Calculate risk score (0-100, lower is better)
  const riskScore = ((averageRisk - 1) / 4) * 100; // Normalize 1-5 to 0-100

  // Determine overall risk level
  let overallRiskLevel: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';
  if (averageRisk >= 4.5) {
    overallRiskLevel = 'Very High';
  } else if (averageRisk >= 3.5) {
    overallRiskLevel = 'High';
  } else if (averageRisk >= 2.5) {
    overallRiskLevel = 'Moderate';
  } else if (averageRisk >= 1.5) {
    overallRiskLevel = 'Low';
  } else {
    overallRiskLevel = 'Very Low';
  }

  // Identify critical and managed risks
  const criticalRisks = riskDetails.filter(r => r.riskLevel >= 4).map(r => r.riskName);
  const managedRisks = riskDetails.filter(r => r.riskLevel <= 2).map(r => r.riskName);

  return {
    overallRiskLevel,
    criticalRisks,
    managedRisks,
    riskScore,
  };
}

/**
 * Calculate scenario analysis
 */
export async function calculateRiskSummationScenarios(
  inputs: RiskFactorInputs
): Promise<{
  conservative: number;
  base: number;
  optimistic: number;
}> {
  // Base case
  const baseResult = await calculateRiskSummationValuation(inputs);

  // Conservative: Increase all risks by 1 level (capped at 5)
  const conservativeInputs: RiskFactorInputs = {
    ...inputs,
    riskFactors: Object.fromEntries(
      Object.entries(inputs.riskFactors).map(([key, value]) => [
        key,
        Math.min(5, value + 1),
      ])
    ) as RiskFactorInputs['riskFactors'],
  };
  const conservativeResult = await calculateRiskSummationValuation(conservativeInputs);

  // Optimistic: Decrease all risks by 1 level (minimum 1)
  const optimisticInputs: RiskFactorInputs = {
    ...inputs,
    riskFactors: Object.fromEntries(
      Object.entries(inputs.riskFactors).map(([key, value]) => [
        key,
        Math.max(1, value - 1),
      ])
    ) as RiskFactorInputs['riskFactors'],
  };
  const optimisticResult = await calculateRiskSummationValuation(optimisticInputs);

  return {
    conservative: conservativeResult.equityValue,
    base: baseResult.equityValue,
    optimistic: optimisticResult.equityValue,
  };
}
