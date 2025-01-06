import { type ValuationFormData } from "../../client/src/lib/validations";
import { type ValuationResult } from "./valuationModels";
import { frameworks, type FrameworkId } from "../lib/compliance/frameworks";

interface ModelWeights {
  dcf: number;
  marketMultiples: number;
  assetBased: number;
  realOptions: number;
  precedentTransactions: number;
}

interface ModelRecommendation {
  primaryModel: string;
  secondaryModel: string;
  weights: ModelWeights;
  rationale: string[];
  complianceNotes: string[];
}

export function recommendValuationModels(data: ValuationFormData): ModelRecommendation {
  const weights: ModelWeights = {
    dcf: 0,
    marketMultiples: 0,
    assetBased: 0,
    realOptions: 0,
    precedentTransactions: 0,
  };

  const rationale: string[] = [];
  const complianceNotes: string[] = [];

  // Purpose-based recommendations
  switch (data.valuationPurpose) {
    case 'fundraising':
      weights.dcf = 0.4;
      weights.marketMultiples = 0.4;
      weights.realOptions = 0.2;
      rationale.push("Fundraising typically requires forward-looking valuation methods");
      complianceNotes.push("Include detailed growth assumptions and market comparables");
      break;
    case 'exit':
    case 'acquisition':
      weights.precedentTransactions = 0.5;
      weights.assetBased = 0.3;
      weights.marketMultiples = 0.2;
      rationale.push("M&A valuations heavily rely on comparable transaction data");
      complianceNotes.push("Document all comparable transactions used in analysis");
      break;
    case 'esop':
      weights.marketMultiples = 0.6;
      weights.dcf = 0.4;
      rationale.push("ESOP valuations require fair market value determination");
      complianceNotes.push("Ensure compliance with 409A requirements for US companies");
      break;
    default:
      weights.dcf = 0.4;
      weights.marketMultiples = 0.4;
      weights.realOptions = 0.2;
  }

  // Adjust weights based on business characteristics
  if (data.stage === 'early_revenue' && ['technology', 'healthcare'].includes(data.sector)) {
    weights.realOptions = Math.max(weights.realOptions, 0.3);
    weights.dcf = Math.min(weights.dcf, 0.3);
    rationale.push("Early-stage tech companies benefit from real options valuation");
  }

  if (data.stage === 'mature' && ['industrial', 'manufacturing'].includes(data.sector)) {
    weights.assetBased = Math.max(weights.assetBased, 0.3);
    weights.marketMultiples = Math.min(weights.marketMultiples, 0.3);
    rationale.push("Asset-heavy industries require consideration of tangible assets");
  }

  // Add compliance requirements based on region
  switch (data.region.toLowerCase()) {
    case 'india':
      complianceNotes.push("Include ICAI-compliant DCF analysis with detailed assumptions");
      break;
    case 'us':
      complianceNotes.push("Ensure 409A compliance for fair market value determination");
      break;
    default:
      complianceNotes.push("Follow IVS guidelines for model selection and documentation");
  }

  // Normalize weights to sum to 1
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  Object.keys(weights).forEach((key) => {
    weights[key as keyof ModelWeights] /= totalWeight;
  });

  // Determine primary and secondary models
  const sortedModels = Object.entries(weights)
    .sort(([, a], [, b]) => b - a);
  
  return {
    primaryModel: sortedModels[0][0],
    secondaryModel: sortedModels[1][0],
    weights,
    rationale,
    complianceNotes,
  };
}

export function calculateHybridValuation(
  results: Record<string, ValuationResult>,
  weights: ModelWeights
): ValuationResult {
  let weightedValue = 0;
  const methodologies: string[] = [];
  const combinedAssumptions: Record<string, any> = {};

  // Calculate weighted average value
  Object.entries(results).forEach(([method, result]) => {
    const weight = weights[method as keyof ModelWeights];
    if (weight > 0) {
      weightedValue += result.enterpriseValue * weight;
      methodologies.push(`${method} (${(weight * 100).toFixed(1)}%)`);
      Object.assign(combinedAssumptions, result.assumptions);
    }
  });

  return {
    enterpriseValue: weightedValue,
    methodology: `Hybrid Approach using ${methodologies.join(", ")}`,
    assumptions: combinedAssumptions,
    sensitivityAnalysis: {
      growthRate: results.dcf?.sensitivityAnalysis.growthRate || {},
      discountRate: results.dcf?.sensitivityAnalysis.discountRate || {},
    },
    details: {
      ...results.dcf?.details,
      ...results.marketMultiples?.details,
      ...results.assetBased?.details,
      ...results.realOptions?.details,
      ...results.precedentTransactions?.details,
    },
  };
}
