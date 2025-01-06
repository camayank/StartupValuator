import { type ValuationFormData } from "../../client/src/lib/validations";
import { type ValuationResult } from "./valuationModels";
import { generateValuationInsights } from "./categoryValuation";
import { getCachedMarketSentiment } from "../lib/marketSentiment";
import { getEconomicIndicators } from "../lib/marketDataService";

interface ReportOptions {
  includeSections?: {
    appendices?: boolean;
    detailedCalculations?: boolean;
    marketData?: boolean;
  };
  format?: 'full' | 'summary';
  branding?: {
    logo?: string;
    primaryColor?: string;
  };
  language?: string;
}

interface ValuationReport {
  metadata: {
    businessName: string;
    valuationDate: string;
    purpose: string;
    currency: string;
    reportFormat: string;
  };
  executiveSummary: {
    valuationResult: number;
    methodsUsed: string[];
    keyAssumptions: Record<string, any>;
    highlights: string[];
  };
  businessOverview: {
    description: string;
    industry: string;
    stage: string;
    marketPosition: {
      strengths: string[];
      opportunities: string[];
    };
    teamAndGovernance: {
      experience: number;
      keyMembers?: string[];
    };
  };
  valuationApproach: {
    methodology: {
      primary: string;
      secondary: string;
      rationale: string[];
    };
    assumptions: {
      financial: Record<string, any>;
      market: Record<string, any>;
      operations: Record<string, any>;
    };
    results: {
      breakdown: Record<string, number>;
      sensitivityAnalysis: Record<string, any>;
      scenarios: {
        best: { value: number; key_drivers: string[] };
        base: { value: number; key_drivers: string[] };
        worst: { value: number; key_drivers: string[] };
      };
    };
  };
  riskAnalysis: {
    summary: string;
    keyRisks: Array<{
      category: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      mitigation: string;
    }>;
    sensitivityFactors: Array<{
      factor: string;
      impact: string;
      recommendation: string;
    }>;
  };
  compliance: {
    framework: string;
    requirements: Array<{
      category: string;
      status: 'compliant' | 'partial' | 'non-compliant';
      notes: string[];
    }>;
  };
  appendices: {
    marketData: {
      peerComparison: Record<string, any>;
      industryMetrics: Record<string, any>;
    };
    detailedCalculations: Record<string, any>;
    methodologyNotes: string[];
  };
  keyAssumptionsAndInputs: {
    inputs: Record<string, any>;
    assumptions: Record<string, any>;
  };
  regionalAdjustments: {
    region: string;
    adjustments: Record<string, any>;
    economicIndicators: {
      inflation: number;
      riskFreeRate: number;
      gdpGrowth: number;
      timestamp: string;
    };
  };
}

export async function generateValuationReport(
  data: ValuationFormData,
  valuation: ValuationResult,
  options: ReportOptions = {}
): Promise<ValuationReport> {
  const marketSentiment = await getCachedMarketSentiment(data);
  const insights = generateValuationInsights(data, marketSentiment);
  const economicData = await getEconomicIndicators(data.region);

  // Generate AI-driven key highlights
  const highlights = generateKeyHighlights(data, valuation, marketSentiment);

  const report: ValuationReport = {
    metadata: {
      businessName: data.businessName || "Unnamed Business",
      valuationDate: new Date().toISOString().split('T')[0],
      purpose: data.valuationPurpose,
      currency: data.currency || "USD",
      reportFormat: options.format || 'full'
    },
    executiveSummary: {
      valuationResult: valuation.enterpriseValue,
      methodsUsed: [valuation.methodology],
      keyAssumptions: {
        growthRate: `${data.growthRate}%`,
        discountRate: `${valuation.assumptions.discountRate}%`,
        margins: `${data.margins}%`
      },
      highlights
    },
    businessOverview: {
      description: generateBusinessDescription(data),
      industry: data.sector,
      stage: data.stage,
      marketPosition: {
        strengths: insights.strengths,
        opportunities: insights.suggestions
      },
      teamAndGovernance: {
        experience: data.teamExperience,
        keyMembers: data.keyTeamMembers
      }
    },
    valuationApproach: {
      methodology: {
        primary: valuation.methodology,
        secondary: valuation.details.marketMultiples ? "Market Multiples" : "DCF",
        rationale: generateMethodologyRationale(data, valuation)
      },
      assumptions: {
        financial: valuation.assumptions,
        market: {
          industryGrowth: marketSentiment.peerComparison?.averages.growthRate || 0,
          marketSize: marketSentiment.growthAnalysis?.marketSize || {}
        },
        operations: {
          margins: data.margins,
          scalability: data.scalabilityPotential
        }
      },
      results: {
        breakdown: generateValuationBreakdown(valuation),
        sensitivityAnalysis: valuation.sensitivityAnalysis,
        scenarios: generateScenarioSummary(valuation)
      }
    },
    riskAnalysis: {
      summary: generateRiskSummary(data, marketSentiment),
      keyRisks: generateKeyRisks(data, marketSentiment),
      sensitivityFactors: generateSensitivityFactors(valuation)
    },
    compliance: {
      framework: determineComplianceFramework(data),
      requirements: generateComplianceRequirements(data)
    },
    appendices: options.includeSections?.appendices !== false ? {
      marketData: {
        peerComparison: marketSentiment.peerComparison || {},
        industryMetrics: {
          growthRate: marketSentiment.peerComparison?.averages.growthRate || 0,
          margins: marketSentiment.peerComparison?.averages.margins || 0
        }
      },
      detailedCalculations: options.includeSections?.detailedCalculations !== false ? {
        dcf: valuation.details.dcf || {},
        marketMultiples: valuation.details.marketMultiples || {}
      } : {},
      methodologyNotes: generateMethodologyNotes(valuation)
    } : { marketData: {}, detailedCalculations: {}, methodologyNotes: [] },
    keyAssumptionsAndInputs: {
      inputs: filterRelevantInputs(data),
      assumptions: filterRelevantAssumptions(valuation.assumptions)
    },
    regionalAdjustments: {
      region: data.region,
      adjustments: generateRegionalAdjustments(data),
      economicIndicators: {
        inflation: economicData.inflation,
        riskFreeRate: economicData.riskFreeRate,
        gdpGrowth: economicData.gdpGrowth,
        timestamp: economicData.timestamp
      }
    }
  };

  return report;
}

function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(value);
}

function generateBusinessDescription(data: ValuationFormData): string {
  return `${data.businessName || "The company"} is a ${data.stage} stage business 
    operating in the ${data.sector} sector. ${
    data.competitiveDifferentiation === 'high' 
      ? "It maintains a strong competitive advantage in its market." 
      : data.competitiveDifferentiation === 'medium'
      ? "It has established a moderate market position."
      : "It is working to establish its market position."
    }`;
}

function generateKeyHighlights(data: ValuationFormData, valuation: ValuationResult, marketSentiment: any): string[] {
  const highlights = [
    `Enterprise value of ${formatCurrency(valuation.enterpriseValue, data.currency)}`,
    `Based on ${valuation.methodology}`,
    `Reflecting ${data.stage} stage ${data.sector} company`
  ];

  // Add comparative insights
  if (marketSentiment.peerComparison?.averages.growthRate && data.growthRate) {
    const peerGrowth = marketSentiment.peerComparison.averages.growthRate;
    if (data.growthRate > peerGrowth) {
      highlights.push(`Growth rate of ${data.growthRate}% exceeds industry average of ${peerGrowth}%`);
    }
  }

  // Add Monte Carlo confidence intervals if available
  if (valuation.monteCarloAnalysis?.confidenceIntervals.p90) {
    const { lower, upper } = valuation.monteCarloAnalysis.confidenceIntervals.p90;
    highlights.push(`90% confidence valuation range: ${formatCurrency(lower)} to ${formatCurrency(upper)}`);
  }

  return highlights;
}

function generateMethodologyRationale(data: ValuationFormData, valuation: ValuationResult): string[] {
  return [
    `Selected based on ${data.stage} stage and ${data.sector} sector characteristics`,
    `Aligned with ${data.valuationPurpose} purpose`,
    data.stage === 'early_revenue' ? 
      "Incorporates growth potential and market opportunity" :
      "Reflects established business metrics and market position"
  ];
}

function generateValuationBreakdown(valuation: ValuationResult): Record<string, number> {
  const breakdown = {
    enterpriseValue: valuation.enterpriseValue
  };

  if (valuation.details.dcf) {
    Object.assign(breakdown, {
      presentValue: valuation.details.dcf.presentValue,
      terminalValue: valuation.details.dcf.terminalValue
    });
  }

  return breakdown;
}

function generateScenarioSummary(valuation: ValuationResult) {
  return {
    best: {
      value: valuation.scenarioAnalysis?.best.value || 0,
      key_drivers: ["Higher growth rate", "Lower discount rate"]
    },
    base: {
      value: valuation.scenarioAnalysis?.base.value || 0,
      key_drivers: ["Expected market conditions", "Current performance trends"]
    },
    worst: {
      value: valuation.scenarioAnalysis?.worst.value || 0,
      key_drivers: ["Lower growth rate", "Higher discount rate"]
    }
  };
}

function generateRiskSummary(data: ValuationFormData, marketSentiment: any): string {
  return `Based on comprehensive analysis of business, market, and financial risks. 
    ${data.stage === 'early_revenue' ? 'Early-stage risks are primarily related to market adoption and scaling.' :
    'Established business risks focus on market position maintenance and growth execution.'}`;
}

function generateKeyRisks(data: ValuationFormData, marketSentiment: any): Array<{
  category: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}> {
  const risks = [];

  // Market Risk
  if (marketSentiment.sentimentByFactor?.marketConditions < 0.5) {
    risks.push({
      category: "Market",
      description: "Challenging market conditions affecting growth potential",
      impact: "high" as const,
      mitigation: "Diversify product offerings and target markets"
    });
  }

  // Financial Risk
  if (data.cashFlowStability === 'volatile') {
    risks.push({
      category: "Financial",
      description: "Volatile cash flow patterns",
      impact: "high" as const,
      mitigation: "Implement robust cash management and forecasting systems"
    });
  }

  // Operational Risk
  if (data.teamExperience < 5) {
    risks.push({
      category: "Operational",
      description: "Limited team experience in the industry",
      impact: "medium" as const,
      mitigation: "Strengthen team with experienced industry professionals"
    });
  }

  return risks;
}

function generateSensitivityFactors(valuation: ValuationResult): Array<{
  factor: string;
  impact: string;
  recommendation: string;
}> {
  const factors = [];

  // Growth Rate Sensitivity
  if (valuation.sensitivityAnalysis.growthRate) {
    const growthValues = Object.values(valuation.sensitivityAnalysis.growthRate);
    if (growthValues.length > 0) {
      const growthImpact = Math.max(...growthValues) - Math.min(...growthValues);
      factors.push({
        factor: "Growth Rate",
        impact: `${formatCurrency(growthImpact)} valuation range`,
        recommendation: "Focus on sustainable growth initiatives"
      });
    }
  }

  // Discount Rate Sensitivity
  if (valuation.sensitivityAnalysis.discountRate) {
    const discountValues = Object.values(valuation.sensitivityAnalysis.discountRate);
    if (discountValues.length > 0) {
      const discountImpact = Math.max(...discountValues) - Math.min(...discountValues);
      factors.push({
        factor: "Discount Rate",
        impact: `${formatCurrency(discountImpact)} valuation range`,
        recommendation: "Strengthen risk management practices"
      });
    }
  }

  return factors;
}

function determineComplianceFramework(data: ValuationFormData): string {
  switch (data.region.toLowerCase()) {
    case 'us':
      return data.valuationPurpose === 'esop' ? '409A' : 'USPAP';
    case 'india':
      return 'ICAI';
    default:
      return 'IVS';
  }
}

function generateComplianceRequirements(data: ValuationFormData): Array<{
  category: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  notes: string[];
}> {
  const requirements = [];

  // Documentation Requirements
  requirements.push({
    category: "Documentation",
    status: 'compliant' as const,
    notes: [
      "Comprehensive valuation methodology documented",
      "Key assumptions clearly stated",
      "Market data sources referenced"
    ]
  });

  // Methodology Requirements
  requirements.push({
    category: "Methodology",
    status: data.methodologyCompliance ? 'compliant' as const : 'partial' as const,
    notes: [
      "Standard valuation approaches considered",
      "Method selection justified",
      "Compliance with framework guidelines"
    ]
  });

  return requirements;
}

function generateMethodologyNotes(valuation: ValuationResult): string[] {
  return [
    "Valuation methodology aligned with international standards",
    "Market data sourced from reliable industry databases",
    "Risk adjustments based on comprehensive analysis",
    `Primary method (${valuation.methodology}) selected based on business characteristics`
  ];
}

function filterRelevantInputs(data: ValuationFormData): Record<string, any> {
  return {
    financialMetrics: {
      revenue: data.revenue,
      margins: data.margins,
      growthRate: data.growthRate
    },
    businessCharacteristics: {
      stage: data.stage,
      sector: data.sector,
      competitiveDifferentiation: data.competitiveDifferentiation
    },
    riskFactors: {
      cashFlowStability: data.cashFlowStability,
      teamExperience: data.teamExperience
    }
  };
}

function filterRelevantAssumptions(assumptions: Record<string, any>): Record<string, any> {
  return {
    valuation: {
      discountRate: assumptions.discountRate,
      terminalGrowthRate: assumptions.terminalGrowthRate,
      beta: assumptions.beta
    },
    market: {
      industryMultiple: assumptions.industryMultiple,
      riskFreeRate: assumptions.riskFreeRate
    }
  };
}

function generateRegionalAdjustments(data: ValuationFormData): Record<string, any> {
  const adjustments: Record<string, any> = {};

  // Add region-specific adjustments
  switch (data.region.toLowerCase()) {
    case 'us':
      adjustments.marketRiskPremium = 5.5;
      adjustments.countryRisk = 0;
      break;
    case 'india':
      adjustments.marketRiskPremium = 7.5;
      adjustments.countryRisk = 3.0;
      break;
    default:
      adjustments.marketRiskPremium = 6.0;
      adjustments.countryRisk = 2.0;
  }

  return adjustments;
}