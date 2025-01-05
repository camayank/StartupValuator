import type { ValuationFormData } from "../../client/src/lib/validations";

interface MethodRecommendation {
  method: 'dcf' | 'comparables' | 'hybrid';
  confidence: number;
  reasoning: string;
  requirements: string[];
  pros: string[];
  cons: string[];
}

interface MethodAnalysis {
  primaryMethod: MethodRecommendation;
  alternativeMethods: MethodRecommendation[];
  dataQualityScore: number;
  suggestions: string[];
}

function analyzeDataQuality(data: ValuationFormData): {
  score: number;
  missingFields: string[];
  suggestions: string[];
} {
  const requiredFields = [
    { field: 'revenue', name: 'Revenue' },
    { field: 'margins', name: 'Profit Margins' },
    { field: 'growthRate', name: 'Growth Rate' },
    { field: 'industry', name: 'Industry' },
    { field: 'stage', name: 'Company Stage' },
  ];

  const missingFields = requiredFields.filter(
    ({ field }) => !data[field as keyof ValuationFormData]
  ).map(({ name }) => name);

  // Calculate data quality score
  const score = Math.min(100, Math.max(0,
    100 - (missingFields.length * 20) +
    (data.marketValidation === 'proven' ? 10 : 0) +
    (data.teamExperience ? Math.min(data.teamExperience * 5, 20) : 0)
  ));

  // Generate suggestions for improvement
  const suggestions = [];
  if (missingFields.length > 0) {
    suggestions.push(`Provide ${missingFields.join(', ')} to improve valuation accuracy`);
  }
  if (!data.marketValidation || data.marketValidation === 'none') {
    suggestions.push('Add market validation evidence to strengthen the valuation basis');
  }
  if (!data.intellectualProperty) {
    suggestions.push('Include intellectual property details for a more comprehensive valuation');
  }

  return { score, missingFields, suggestions };
}

function recommendValuationMethod(data: ValuationFormData): MethodAnalysis {
  const { score, suggestions } = analyzeDataQuality(data);
  
  // Define method-specific criteria and scoring
  const methodScores = {
    dcf: {
      score: calculateDCFScore(data),
      reasoning: getDCFReasoning(data),
      requirements: [
        'Historical financial data',
        'Reliable growth projections',
        'Clear business model',
        'Predictable cash flows'
      ],
      pros: [
        'Most thorough valuation approach',
        'Considers future growth potential',
        'Industry-standard method',
        'Highly detailed analysis'
      ],
      cons: [
        'Requires significant historical data',
        'Sensitive to assumptions',
        'Complex to explain',
        'Time-intensive analysis'
      ]
    },
    comparables: {
      score: calculateComparablesScore(data),
      reasoning: getComparablesReasoning(data),
      requirements: [
        'Industry classification',
        'Basic financial metrics',
        'Market position information',
        'Competitor data'
      ],
      pros: [
        'Market-based approach',
        'Easy to understand',
        'Quick to implement',
        'Based on real transactions'
      ],
      cons: [
        'Depends on market conditions',
        'May not capture unique aspects',
        'Limited by available comparables',
        'Market volatility impact'
      ]
    },
    hybrid: {
      score: calculateHybridScore(data),
      reasoning: getHybridReasoning(data),
      requirements: [
        'Moderate financial history',
        'Industry benchmarks',
        'Growth indicators',
        'Market position data'
      ],
      pros: [
        'Balanced approach',
        'Combines multiple perspectives',
        'More robust results',
        'Flexible methodology'
      ],
      cons: [
        'More complex to execute',
        'Requires broader dataset',
        'May show conflicting results',
        'Needs careful weighting'
      ]
    }
  };

  // Determine primary and alternative methods
  const sortedMethods = Object.entries(methodScores)
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([method, details]) => ({
      method: method as 'dcf' | 'comparables' | 'hybrid',
      confidence: details.score,
      reasoning: details.reasoning,
      requirements: details.requirements,
      pros: details.pros,
      cons: details.cons
    }));

  return {
    primaryMethod: sortedMethods[0],
    alternativeMethods: sortedMethods.slice(1),
    dataQualityScore: score,
    suggestions
  };
}

function calculateDCFScore(data: ValuationFormData): number {
  let score = 60; // Base score

  // Adjust based on available data
  if (data.revenue) score += 10;
  if (data.margins) score += 10;
  if (data.growthRate) score += 10;
  
  // Stage-based adjustments
  if (data.stage === 'scaling' || data.stage === 'growth') score += 15;
  if (data.stage === 'ideation' || data.stage === 'validation') score -= 20;

  // Market validation impact
  if (data.marketValidation === 'proven') score += 15;
  if (data.marketValidation === 'early') score += 5;

  return Math.min(100, Math.max(0, score));
}

function calculateComparablesScore(data: ValuationFormData): number {
  let score = 70; // Base score

  // Industry presence
  if (data.industry) score += 15;
  
  // Early stage bonus
  if (data.stage === 'ideation' || data.stage === 'validation') score += 15;
  if (data.stage === 'scaling') score -= 10;

  // Market data availability
  if (data.marketValidation === 'proven') score += 10;
  if (!data.revenue) score -= 10;

  return Math.min(100, Math.max(0, score));
}

function calculateHybridScore(data: ValuationFormData): number {
  let score = 75; // Base score

  // Balanced data availability
  if (data.revenue) score += 5;
  if (data.margins) score += 5;
  if (data.growthRate) score += 5;
  if (data.industry) score += 5;

  // Stage considerations
  if (data.stage === 'growth') score += 15;
  if (data.stage === 'scaling') score += 10;

  // Market validation
  if (data.marketValidation === 'proven') score += 10;
  if (data.marketValidation === 'early') score += 5;

  return Math.min(100, Math.max(0, score));
}

function getDCFReasoning(data: ValuationFormData): string {
  if (data.stage === 'scaling' || data.stage === 'growth') {
    return "DCF is highly suitable due to established financial history and predictable cash flows";
  }
  if (data.marketValidation === 'proven') {
    return "Strong market validation supports reliable cash flow projections";
  }
  return "DCF provides detailed analysis but requires quality historical data";
}

function getComparablesReasoning(data: ValuationFormData): string {
  if (data.stage === 'ideation' || data.stage === 'validation') {
    return "Market comparables are ideal for early-stage companies with limited financial history";
  }
  if (data.industry) {
    return "Strong industry presence enables accurate peer comparison";
  }
  return "Market-based approach provides quick insights based on similar companies";
}

function getHybridReasoning(data: ValuationFormData): string {
  if (data.stage === 'growth') {
    return "Hybrid approach balances historical performance with market potential";
  }
  if (data.marketValidation === 'proven') {
    return "Combined method leverages both market data and company performance";
  }
  return "Balanced approach provides comprehensive valuation perspective";
}

export { recommendValuationMethod, type MethodAnalysis, type MethodRecommendation };
