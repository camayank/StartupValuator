/**
 * Investment Readiness Assessment Service
 * Evaluates startup readiness for investment across 5 key dimensions
 */

import type {
  SelectCompany,
  SelectFinancialData,
  SelectOperationalMetrics,
  SelectFounder,
  SelectFundingRound,
  SelectCapTable,
} from '../../db/schema';

interface ReadinessAssessmentInputs {
  company: SelectCompany;
  financials: SelectFinancialData[];
  operationalMetrics: SelectOperationalMetrics[];
  founders: SelectFounder[];
  fundingRounds: SelectFundingRound[];
  capTable: SelectCapTable[];
}

interface ReadinessScore {
  score: number;
  maxScore: number;
  factors: Record<string, { score: number; max: number; status: string; details?: string }>;
}

interface RedFlag {
  severity: 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  impact: string;
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  action: string;
  expectedImpact: string;
  timeframe?: string;
}

export interface InvestmentReadinessResult {
  scoreId?: string;
  companyId: string;
  assessmentDate: string;
  overallScore: number;
  scoreBreakdown: {
    financialHealth: ReadinessScore;
    marketOpportunity: ReadinessScore;
    teamStrength: ReadinessScore;
    tractionExecution: ReadinessScore;
    governanceCompliance: ReadinessScore;
  };
  redFlags: RedFlag[];
  recommendations: Recommendation[];
  investorReadiness: 'not_ready' | 'needs_improvement' | 'moderate' | 'ready' | 'highly_ready';
  estimatedTimeToReady?: string;
}

/**
 * Assess investment readiness across all dimensions
 */
export async function assessInvestmentReadiness(
  inputs: ReadinessAssessmentInputs
): Promise<InvestmentReadinessResult> {
  // 1. Financial Health Score (0-25)
  const financialScore = calculateFinancialHealthScore(inputs.financials, inputs.company);

  // 2. Market Opportunity Score (0-20)
  const marketScore = calculateMarketOpportunityScore(inputs.company);

  // 3. Team Strength Score (0-20)
  const teamScore = calculateTeamStrengthScore(inputs.founders);

  // 4. Traction & Execution Score (0-20)
  const tractionScore = calculateTractionScore(inputs.operationalMetrics, inputs.financials);

  // 5. Governance & Compliance Score (0-15)
  const governanceScore = calculateGovernanceScore(inputs.company, inputs.capTable);

  const overallScore =
    financialScore.score +
    marketScore.score +
    teamScore.score +
    tractionScore.score +
    governanceScore.score;

  // Identify red flags
  const redFlags = identifyRedFlags(inputs);

  // Generate recommendations
  const recommendations = generateRecommendations(
    financialScore,
    marketScore,
    teamScore,
    tractionScore,
    governanceScore,
    redFlags
  );

  // Categorize readiness
  const investorReadiness = categorizeReadiness(overallScore);

  // Estimate time to ready
  const estimatedTimeToReady = estimateTimeToReady(overallScore, recommendations);

  return {
    companyId: inputs.company.companyId,
    assessmentDate: new Date().toISOString().split('T')[0],
    overallScore,
    scoreBreakdown: {
      financialHealth: financialScore,
      marketOpportunity: marketScore,
      teamStrength: teamScore,
      tractionExecution: tractionScore,
      governanceCompliance: governanceScore,
    },
    redFlags,
    recommendations,
    investorReadiness,
    estimatedTimeToReady,
  };
}

/**
 * Calculate Financial Health Score (0-25)
 */
function calculateFinancialHealthScore(
  financials: SelectFinancialData[],
  company: SelectCompany
): ReadinessScore {
  const result: ReadinessScore = {
    score: 0,
    maxScore: 25,
    factors: {},
  };

  if (financials.length === 0) {
    return result;
  }

  const latestYear = financials[financials.length - 1];
  const previousYear = financials[financials.length - 2];

  // 1. Revenue Growth (0-5)
  if (previousYear && Number(latestYear.revenue) > 0) {
    const growthRate =
      ((Number(latestYear.revenue) - Number(previousYear.revenue)) / Number(previousYear.revenue)) * 100;

    let score = 0;
    let status = '';

    if (growthRate >= 100) {
      score = 5;
      status = 'excellent';
    } else if (growthRate >= 50) {
      score = 4;
      status = 'good';
    } else if (growthRate >= 30) {
      score = 3;
      status = 'moderate';
    } else if (growthRate >= 10) {
      score = 2;
      status = 'fair';
    } else if (growthRate > 0) {
      score = 1;
      status = 'needs_improvement';
    }

    result.score += score;
    result.factors.revenueGrowth = {
      score,
      max: 5,
      status,
      details: `${growthRate.toFixed(1)}% YoY growth`,
    };
  }

  // 2. Gross Margin (0-5)
  if (Number(latestYear.revenue) > 0) {
    const grossMargin = (Number(latestYear.grossProfit) / Number(latestYear.revenue)) * 100;

    let score = 0;
    let status = '';

    if (grossMargin >= 70) {
      score = 5;
      status = 'excellent';
    } else if (grossMargin >= 50) {
      score = 4;
      status = 'good';
    } else if (grossMargin >= 30) {
      score = 3;
      status = 'moderate';
    } else if (grossMargin >= 10) {
      score = 2;
      status = 'fair';
    } else if (grossMargin > 0) {
      score = 1;
      status = 'needs_improvement';
    }

    result.score += score;
    result.factors.grossMargin = {
      score,
      max: 5,
      status,
      details: `${grossMargin.toFixed(1)}% gross margin`,
    };
  }

  // 3. Cash Runway (0-5)
  if (Number(latestYear.monthlyBurnRate) > 0 && Number(latestYear.cashInBank) > 0) {
    const runway = Number(latestYear.cashInBank) / Number(latestYear.monthlyBurnRate);

    let score = 0;
    let status = '';

    if (runway >= 24) {
      score = 5;
      status = 'excellent';
    } else if (runway >= 18) {
      score = 4;
      status = 'good';
    } else if (runway >= 12) {
      score = 3;
      status = 'moderate';
    } else if (runway >= 6) {
      score = 2;
      status = 'fair';
    } else {
      score = 1;
      status = 'critical';
    }

    result.score += score;
    result.factors.cashRunway = {
      score,
      max: 5,
      status,
      details: `${runway.toFixed(1)} months runway`,
    };
  }

  // 4. Path to Profitability (0-5)
  const ebitdaTrend = financials.map(f => Number(f.ebitda));
  const improving = ebitdaTrend.every((val, i, arr) => i === 0 || val >= arr[i - 1]);

  let profitScore = 0;
  let profitStatus = '';

  if (Number(latestYear.ebitda) > 0) {
    profitScore = 5;
    profitStatus = 'profitable';
  } else if (improving && Number(latestYear.ebitda) > -Number(latestYear.revenue) * 0.3) {
    profitScore = 3;
    profitStatus = 'improving';
  } else if (improving) {
    profitScore = 2;
    profitStatus = 'trending_positive';
  } else {
    profitScore = 1;
    profitStatus = 'needs_improvement';
  }

  result.score += profitScore;
  result.factors.profitabilityPath = {
    score: profitScore,
    max: 5,
    status: profitStatus,
    details: `Current EBITDA: ₹${(Number(latestYear.ebitda) / 100000).toFixed(2)}L`,
  };

  // 5. Debt-to-Equity (0-5)
  if (Number(latestYear.shareholdersEquity) > 0) {
    const debtToEquity =
      (Number(latestYear.totalLiabilities) - Number(latestYear.shareholdersEquity)) /
      Number(latestYear.shareholdersEquity);

    let debtScore = 0;
    let debtStatus = '';

    if (debtToEquity <= 0.5) {
      debtScore = 5;
      debtStatus = 'excellent';
    } else if (debtToEquity <= 1) {
      debtScore = 4;
      debtStatus = 'good';
    } else if (debtToEquity <= 2) {
      debtScore = 3;
      debtStatus = 'moderate';
    } else if (debtToEquity <= 3) {
      debtScore = 2;
      debtStatus = 'concerning';
    } else {
      debtScore = 1;
      debtStatus = 'high_risk';
    }

    result.score += debtScore;
    result.factors.debtToEquity = {
      score: debtScore,
      max: 5,
      status: debtStatus,
      details: `${debtToEquity.toFixed(2)}:1 ratio`,
    };
  }

  return result;
}

/**
 * Calculate Market Opportunity Score (0-20)
 */
function calculateMarketOpportunityScore(company: SelectCompany): ReadinessScore {
  const result: ReadinessScore = {
    score: 15, // Default moderate score if limited data
    maxScore: 20,
    factors: {},
  };

  // Sector scoring (based on Indian market attractiveness)
  const hotSectors = ['fintech', 'healthtech', 'edtech', 'saas', 'ai', 'cleantech'];
  const matureSectors = ['ecommerce', 'food_delivery', 'cab_aggregator'];

  let sectorScore = 3;
  let sectorStatus = 'moderate';

  if (hotSectors.some(s => company.industrySector.toLowerCase().includes(s))) {
    sectorScore = 5;
    sectorStatus = 'high_potential';
  } else if (matureSectors.some(s => company.industrySector.toLowerCase().includes(s))) {
    sectorScore = 2;
    sectorStatus = 'competitive';
  }

  result.factors.sectorAttractiveness = {
    score: sectorScore,
    max: 5,
    status: sectorStatus,
    details: company.industrySector,
  };

  // Stage appropriateness
  const stageScores: Record<string, number> = {
    ideation: 2,
    mvp: 3,
    pre_revenue: 3,
    revenue: 4,
    growth: 5,
    expansion: 5,
  };

  const stageScore = stageScores[company.currentStage] || 3;
  result.factors.developmentStage = {
    score: stageScore,
    max: 5,
    status: stageScore >= 4 ? 'advanced' : stageScore >= 3 ? 'moderate' : 'early',
    details: company.currentStage,
  };

  // Default scores for other factors (would be enhanced with actual market data)
  result.factors.marketSize = { score: 4, max: 5, status: 'good' };
  result.factors.competitivePosition = { score: 3, max: 5, status: 'moderate' };

  result.score = Object.values(result.factors).reduce((sum, f) => sum + f.score, 0);

  return result;
}

/**
 * Calculate Team Strength Score (0-20)
 */
function calculateTeamStrengthScore(founders: SelectFounder[]): ReadinessScore {
  const result: ReadinessScore = {
    score: 0,
    maxScore: 20,
    factors: {},
  };

  if (founders.length === 0) {
    return result;
  }

  // 1. Founder count (2-3 is ideal)
  let founderCountScore = 0;
  if (founders.length >= 2 && founders.length <= 3) {
    founderCountScore = 5;
  } else if (founders.length === 4) {
    founderCountScore = 4;
  } else if (founders.length === 1) {
    founderCountScore = 3;
  } else {
    founderCountScore = 2;
  }

  result.factors.teamSize = {
    score: founderCountScore,
    max: 5,
    status: founderCountScore >= 4 ? 'optimal' : 'suboptimal',
    details: `${founders.length} founder(s)`,
  };

  // 2. Experience (based on presence of linkedIn and experience text)
  const experiencedFounders = founders.filter(
    f => f.linkedinUrl || (f.previousExperience && f.previousExperience.length > 50)
  ).length;

  let expScore = 0;
  if (experiencedFounders === founders.length) {
    expScore = 5;
  } else if (experiencedFounders >= founders.length / 2) {
    expScore = 4;
  } else {
    expScore = 2;
  }

  result.factors.founderExperience = {
    score: expScore,
    max: 5,
    status: expScore >= 4 ? 'strong' : expScore >= 3 ? 'moderate' : 'limited',
    details: `${experiencedFounders}/${founders.length} with documented experience`,
  };

  // 3. Domain expertise
  const domainExperts = founders.filter(
    f => f.domainExpertise && f.domainExpertise.length > 20
  ).length;

  let domainScore = 0;
  if (domainExperts >= 2) {
    domainScore = 5;
  } else if (domainExperts === 1) {
    domainScore = 3;
  } else {
    domainScore = 1;
  }

  result.factors.domainExpertise = {
    score: domainScore,
    max: 5,
    status: domainScore >= 4 ? 'strong' : domainScore >= 3 ? 'moderate' : 'weak',
  };

  // 4. Educational background
  const educatedFounders = founders.filter(
    f => f.educationBackground && f.educationBackground.length > 20
  ).length;

  let eduScore = Math.min(5, educatedFounders * 2);
  result.factors.education = {
    score: eduScore,
    max: 5,
    status: eduScore >= 4 ? 'strong' : 'moderate',
  };

  result.score = Object.values(result.factors).reduce((sum, f) => sum + f.score, 0);

  return result;
}

/**
 * Calculate Traction & Execution Score (0-20)
 */
function calculateTractionScore(
  metrics: SelectOperationalMetrics[],
  financials: SelectFinancialData[]
): ReadinessScore {
  const result: ReadinessScore = {
    score: 0,
    maxScore: 20,
    factors: {},
  };

  if (metrics.length === 0 || financials.length === 0) {
    result.score = 5; // Minimal score if no data
    return result;
  }

  const latestMetrics = metrics[metrics.length - 1];
  const latestFinancial = financials[financials.length - 1];

  // 1. Customer acquisition
  const totalCustomers = Number(latestMetrics.totalCustomers) || 0;
  let custScore = 0;

  if (totalCustomers >= 10000) {
    custScore = 5;
  } else if (totalCustomers >= 1000) {
    custScore = 4;
  } else if (totalCustomers >= 100) {
    custScore = 3;
  } else if (totalCustomers >= 10) {
    custScore = 2;
  } else if (totalCustomers > 0) {
    custScore = 1;
  }

  result.factors.customerBase = {
    score: custScore,
    max: 5,
    status: custScore >= 4 ? 'strong' : custScore >= 2 ? 'moderate' : 'early',
    details: `${totalCustomers} customers`,
  };

  // 2. Retention rate
  const retentionRate = Number(latestMetrics.customerRetentionRate) || 0;
  let retentionScore = 0;

  if (retentionRate >= 90) {
    retentionScore = 5;
  } else if (retentionRate >= 70) {
    retentionScore = 4;
  } else if (retentionRate >= 50) {
    retentionScore = 3;
  } else if (retentionRate > 0) {
    retentionScore = 2;
  }

  result.factors.retention = {
    score: retentionScore,
    max: 5,
    status: retentionScore >= 4 ? 'excellent' : retentionScore >= 3 ? 'good' : 'needs_improvement',
    details: `${retentionRate.toFixed(1)}% retention`,
  };

  // 3. Unit economics
  const cac = Number(latestMetrics.customerAcquisitionCost) || 0;
  const ltv = Number(latestMetrics.lifetimeValue) || 0;

  let unitEconScore = 0;
  if (ltv > 0 && cac > 0) {
    const ltvCacRatio = ltv / cac;

    if (ltvCacRatio >= 3) {
      unitEconScore = 5;
    } else if (ltvCacRatio >= 2) {
      unitEconScore = 4;
    } else if (ltvCacRatio >= 1.5) {
      unitEconScore = 3;
    } else if (ltvCacRatio >= 1) {
      unitEconScore = 2;
    } else {
      unitEconScore = 1;
    }

    result.factors.unitEconomics = {
      score: unitEconScore,
      max: 5,
      status: unitEconScore >= 4 ? 'healthy' : unitEconScore >= 3 ? 'acceptable' : 'concerning',
      details: `LTV:CAC = ${ltvCacRatio.toFixed(2)}:1`,
    };
  }

  // 4. Product-market fit (NPS as proxy)
  const nps = Number(latestMetrics.netPromoterScore) || 0;
  let pmfScore = 0;

  if (nps >= 50) {
    pmfScore = 5;
  } else if (nps >= 30) {
    pmfScore = 4;
  } else if (nps >= 10) {
    pmfScore = 3;
  } else if (nps > 0) {
    pmfScore = 2;
  }

  result.factors.productMarketFit = {
    score: pmfScore,
    max: 5,
    status: pmfScore >= 4 ? 'strong' : pmfScore >= 3 ? 'moderate' : 'weak',
    details: `NPS: ${nps}`,
  };

  result.score = Object.values(result.factors).reduce((sum, f) => sum + f.score, 0);

  return result;
}

/**
 * Calculate Governance & Compliance Score (0-15)
 */
function calculateGovernanceScore(company: SelectCompany, capTable: SelectCapTable[]): ReadinessScore {
  const result: ReadinessScore = {
    score: 0,
    maxScore: 15,
    factors: {},
  };

  // 1. Legal compliance (5 points)
  let complianceScore = 0;

  if (company.cin) complianceScore += 1;
  if (company.gstNumber) complianceScore += 1;
  if (company.panNumber) complianceScore += 1;
  if (company.dpiitRecognitionNumber) complianceScore += 2;

  result.factors.legalCompliance = {
    score: complianceScore,
    max: 5,
    status: complianceScore >= 4 ? 'excellent' : complianceScore >= 3 ? 'good' : 'needs_improvement',
  };

  // 2. Cap table clarity (5 points)
  let capTableScore = 0;

  if (capTable.length > 0) {
    capTableScore = 3;

    // Check for clean cap table (not too fragmented)
    if (capTable.length <= 10) {
      capTableScore += 2;
    } else if (capTable.length <= 20) {
      capTableScore += 1;
    }
  }

  result.factors.capTableManagement = {
    score: capTableScore,
    max: 5,
    status: capTableScore >= 4 ? 'clean' : capTableScore >= 3 ? 'acceptable' : 'needs_cleanup',
    details: `${capTable.length} shareholders`,
  };

  // 3. Corporate governance (5 points)
  let govScore = 3; // Default moderate score

  if (company.industrySector && company.businessDescription) {
    govScore += 2; // Well-documented business
  }

  result.factors.corporateGovernance = {
    score: govScore,
    max: 5,
    status: govScore >= 4 ? 'strong' : 'moderate',
  };

  result.score = Object.values(result.factors).reduce((sum, f) => sum + f.score, 0);

  return result;
}

/**
 * Identify red flags
 */
function identifyRedFlags(inputs: ReadinessAssessmentInputs): RedFlag[] {
  const redFlags: RedFlag[] = [];

  // Financial red flags
  if (inputs.financials.length > 0) {
    const latest = inputs.financials[inputs.financials.length - 1];

    // High debt-to-equity ratio
    if (Number(latest.shareholdersEquity) > 0) {
      const debtToEquity =
        (Number(latest.totalLiabilities) - Number(latest.shareholdersEquity)) /
        Number(latest.shareholdersEquity);

      if (debtToEquity > 2) {
        redFlags.push({
          severity: 'high',
          category: 'financial',
          issue: `Debt-to-equity ratio exceeds 2:1 (${debtToEquity.toFixed(2)}:1)`,
          impact: 'May deter equity investors and limit funding options',
        });
      }
    }

    // Low cash runway
    if (Number(latest.monthlyBurnRate) > 0 && Number(latest.cashInBank) > 0) {
      const runway = Number(latest.cashInBank) / Number(latest.monthlyBurnRate);

      if (runway < 6) {
        redFlags.push({
          severity: 'high',
          category: 'financial',
          issue: `Critical cash runway (${runway.toFixed(1)} months)`,
          impact: 'Urgent need for funding to avoid operational disruptions',
        });
      }
    }
  }

  // Team red flags
  if (inputs.founders.length === 1) {
    redFlags.push({
      severity: 'medium',
      category: 'team',
      issue: 'Solo founder (no co-founder)',
      impact: 'Single point of failure; investors prefer balanced founding teams',
    });
  }

  const foundersWithoutLinkedIn = inputs.founders.filter(f => !f.linkedinUrl).length;
  if (foundersWithoutLinkedIn === inputs.founders.length && inputs.founders.length > 0) {
    redFlags.push({
      severity: 'medium',
      category: 'team',
      issue: 'Founders lack professional online presence',
      impact: 'Harder for investors to conduct due diligence',
    });
  }

  // Compliance red flags
  if (!inputs.company.gstNumber && Number(inputs.financials[inputs.financials.length - 1]?.revenue || 0) > 2000000) {
    redFlags.push({
      severity: 'high',
      category: 'compliance',
      issue: 'No GST registration despite significant revenue',
      impact: 'Legal and tax compliance risk',
    });
  }

  if (!inputs.company.dpiitRecognitionNumber) {
    redFlags.push({
      severity: 'low',
      category: 'compliance',
      issue: 'No DPIIT recognition',
      impact: 'Missing access to government schemes and tax benefits',
    });
  }

  return redFlags;
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  financialScore: ReadinessScore,
  marketScore: ReadinessScore,
  teamScore: ReadinessScore,
  tractionScore: ReadinessScore,
  governanceScore: ReadinessScore,
  redFlags: RedFlag[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Address high-severity red flags first
  const highSeverityFlags = redFlags.filter(f => f.severity === 'high');
  for (const flag of highSeverityFlags) {
    if (flag.category === 'financial' && flag.issue.includes('cash runway')) {
      recommendations.push({
        priority: 'high',
        category: 'financial',
        action: 'Secure bridge financing or extend runway through cost optimization',
        expectedImpact: 'Prevent operational disruption and buy time for proper fundraising',
        timeframe: 'Immediate (within 1 month)',
      });
    }

    if (flag.category === 'financial' && flag.issue.includes('Debt-to-equity')) {
      recommendations.push({
        priority: 'high',
        category: 'financial',
        action: 'Reduce debt burden through debt-to-equity conversion or debt restructuring',
        expectedImpact: '+3-5 points on financial health score',
        timeframe: '2-3 months',
      });
    }

    if (flag.category === 'compliance') {
      recommendations.push({
        priority: 'high',
        category: 'compliance',
        action: 'Complete all pending regulatory compliances immediately',
        expectedImpact: 'Eliminate deal-breaker issues for investors',
        timeframe: 'Immediate',
      });
    }
  }

  // Financial improvements
  if (financialScore.score < 15) {
    const grossMarginFactor = financialScore.factors.grossMargin;
    if (grossMarginFactor && grossMarginFactor.score < 3) {
      recommendations.push({
        priority: 'high',
        category: 'financial',
        action: 'Improve gross margins through pricing optimization or cost reduction',
        expectedImpact: '+2-4 points on financial health score',
        timeframe: '3-6 months',
      });
    }
  }

  // Team improvements
  if (teamScore.score < 12) {
    recommendations.push({
      priority: 'medium',
      category: 'team',
      action: 'Strengthen team by adding experienced co-founder or senior hires in key areas',
      expectedImpact: '+3-5 points on team strength score',
      timeframe: '2-4 months',
    });
  }

  // Traction improvements
  if (tractionScore.score < 12) {
    const unitEconFactor = tractionScore.factors.unitEconomics;
    if (unitEconFactor && unitEconFactor.score < 3) {
      recommendations.push({
        priority: 'high',
        category: 'traction',
        action: 'Optimize unit economics: reduce CAC and/or increase LTV through retention programs',
        expectedImpact: '+3-5 points on traction score',
        timeframe: '3-6 months',
      });
    }
  }

  // Governance improvements
  if (governanceScore.score < 10) {
    recommendations.push({
      priority: 'medium',
      category: 'governance',
      action: 'Apply for DPIIT recognition and ensure all statutory compliances are up to date',
      expectedImpact: '+2-3 points on governance score + access to government schemes',
      timeframe: '1-2 months',
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Categorize overall readiness
 */
function categorizeReadiness(
  score: number
): 'not_ready' | 'needs_improvement' | 'moderate' | 'ready' | 'highly_ready' {
  if (score >= 80) return 'highly_ready';
  if (score >= 65) return 'ready';
  if (score >= 50) return 'moderate';
  if (score >= 35) return 'needs_improvement';
  return 'not_ready';
}

/**
 * Estimate time to investment ready
 */
function estimateTimeToReady(score: number, recommendations: Recommendation[]): string | undefined {
  if (score >= 65) {
    return undefined; // Already ready
  }

  const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;

  if (score >= 50) {
    return highPriorityCount > 2 ? '4-6 months' : '2-4 months';
  } else if (score >= 35) {
    return highPriorityCount > 3 ? '6-9 months' : '4-6 months';
  } else {
    return '9-12 months';
  }
}
