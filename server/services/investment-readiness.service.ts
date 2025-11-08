/**
 * Investment Readiness Scoring Service
 * Assesses startup readiness for investment on 0-100 scale
 *
 * Scoring Breakdown:
 * - Financial Health: 0-25 points
 * - Market Opportunity: 0-20 points
 * - Team Strength: 0-20 points
 * - Traction & Execution: 0-20 points
 * - Governance & Compliance: 0-15 points
 */

interface ReadinessInputs {
  // Financial data
  revenue: number;
  previousRevenue?: number;
  grossMargin?: number;
  ebitda: number;
  monthlyBurnRate: number;
  cashInBank: number;
  totalLiabilities: number;
  shareholdersEquity: number;

  // Market data
  tam: number;
  sam: number;
  marketGrowthRate: number;
  competitors: number;

  // Team data
  foundersCount: number;
  teamSize: number;
  founderExperience?: number; // Years
  hasTechnicalCofounder: boolean;
  hasBusinessCofounder: boolean;
  advisorsCount?: number;

  // Traction data
  customers: number;
  customerGrowthRate?: number;
  cac?: number;
  ltv?: number;
  retentionRate?: number;

  // Governance
  hasDPIIT: boolean;
  hasAuditedFinancials: boolean;
  hasCompleteCapTable: boolean;
  hasIPProtection: boolean;
  gstCompliant: boolean;
}

interface ReadinessResult {
  overallScore: number; // 0-100
  scoreBreakdown: {
    financialHealth: SectionScore;
    marketOpportunity: SectionScore;
    teamStrength: SectionScore;
    tractionExecution: SectionScore;
    governanceCompliance: SectionScore;
  };
  redFlags: RedFlag[];
  recommendations: Recommendation[];
  investorReadiness: 'not_ready' | 'needs_improvement' | 'moderate' | 'ready' | 'highly_ready';
  estimatedTimeToReady: string;
}

interface SectionScore {
  score: number;
  maxScore: number;
  factors: Record<string, FactorScore>;
  status: 'poor' | 'needs_improvement' | 'moderate' | 'good' | 'excellent';
}

interface FactorScore {
  score: number;
  max: number;
  status: 'poor' | 'needs_improvement' | 'moderate' | 'good' | 'excellent';
  value?: any;
}

interface RedFlag {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  issue: string;
  impact: string;
}

interface Recommendation {
  priority: 'low' | 'medium' | 'high';
  category: string;
  action: string;
  expectedImpact: string;
  timeframe: string;
}

export class InvestmentReadinessService {

  public assess(inputs: ReadinessInputs): ReadinessResult {
    // Calculate each section
    const financialHealth = this.assessFinancialHealth(inputs);
    const marketOpportunity = this.assessMarketOpportunity(inputs);
    const teamStrength = this.assessTeamStrength(inputs);
    const tractionExecution = this.assessTractionExecution(inputs);
    const governanceCompliance = this.assessGovernanceCompliance(inputs);

    const overallScore =
      financialHealth.score +
      marketOpportunity.score +
      teamStrength.score +
      tractionExecution.score +
      governanceCompliance.score;

    // Identify red flags
    const redFlags = this.identifyRedFlags(inputs, { financialHealth, marketOpportunity, teamStrength, tractionExecution, governanceCompliance });

    // Generate recommendations
    const recommendations = this.generateRecommendations(inputs, { financialHealth, marketOpportunity, teamStrength, tractionExecution, governanceCompliance }, redFlags);

    // Determine readiness level
    const investorReadiness = this.categorizeReadiness(overallScore, redFlags);

    // Estimate time to ready
    const estimatedTimeToReady = this.estimateTimeToReady(overallScore, redFlags, recommendations);

    return {
      overallScore: Math.round(overallScore),
      scoreBreakdown: {
        financialHealth,
        marketOpportunity,
        teamStrength,
        tractionExecution,
        governanceCompliance
      },
      redFlags,
      recommendations,
      investorReadiness,
      estimatedTimeToReady
    };
  }

  private assessFinancialHealth(inputs: ReadinessInputs): SectionScore {
    let score = 0;
    const factors: Record<string, FactorScore> = {};

    // 1. Revenue Growth (0-5 points)
    if (inputs.previousRevenue && inputs.revenue > 0) {
      const growthRate = ((inputs.revenue - inputs.previousRevenue) / inputs.previousRevenue) * 100;
      let growthScore = 0;
      if (growthRate >= 100) growthScore = 5;
      else if (growthRate >= 50) growthScore = 4;
      else if (growthRate >= 30) growthScore = 3;
      else if (growthRate >= 10) growthScore = 2;
      else if (growthRate > 0) growthScore = 1;

      factors.revenueGrowth = {
        score: growthScore,
        max: 5,
        status: this.getStatus(growthScore, 5),
        value: `${growthRate.toFixed(1)}% YoY`
      };
      score += growthScore;
    } else if (inputs.revenue > 0) {
      factors.revenueGrowth = { score: 2, max: 5, status: 'moderate', value: 'No historical data' };
      score += 2;
    }

    // 2. Gross Margin (0-5 points)
    if (inputs.grossMargin !== undefined) {
      let marginScore = 0;
      if (inputs.grossMargin >= 70) marginScore = 5;
      else if (inputs.grossMargin >= 50) marginScore = 4;
      else if (inputs.grossMargin >= 30) marginScore = 3;
      else if (inputs.grossMargin >= 10) marginScore = 2;
      else if (inputs.grossMargin > 0) marginScore = 1;

      factors.grossMargin = {
        score: marginScore,
        max: 5,
        status: this.getStatus(marginScore, 5),
        value: `${inputs.grossMargin.toFixed(1)}%`
      };
      score += marginScore;
    }

    // 3. Cash Runway (0-5 points)
    const runway = inputs.monthlyBurnRate > 0 ? inputs.cashInBank / inputs.monthlyBurnRate : 999;
    let runwayScore = 0;
    if (runway >= 24) runwayScore = 5;
    else if (runway >= 18) runwayScore = 4;
    else if (runway >= 12) runwayScore = 3;
    else if (runway >= 6) runwayScore = 2;
    else if (runway >= 3) runwayScore = 1;

    factors.cashRunway = {
      score: runwayScore,
      max: 5,
      status: this.getStatus(runwayScore, 5),
      value: `${Math.min(runway, 99).toFixed(0)} months`
    };
    score += runwayScore;

    // 4. Path to Profitability (0-5 points)
    let profitabilityScore = 0;
    if (inputs.ebitda > 0) {
      profitabilityScore = 5; // Already profitable
    } else if (inputs.revenue > 0) {
      const ebitdaMargin = (inputs.ebitda / inputs.revenue) * 100;
      if (ebitdaMargin > -10) profitabilityScore = 4;
      else if (ebitdaMargin > -30) profitabilityScore = 3;
      else if (ebitdaMargin > -50) profitabilityScore = 2;
      else profitabilityScore = 1;
    }

    factors.profitability = {
      score: profitabilityScore,
      max: 5,
      status: this.getStatus(profitabilityScore, 5),
      value: inputs.ebitda >= 0 ? 'Profitable' : 'Pre-profit'
    };
    score += profitabilityScore;

    // 5. Debt-to-Equity Ratio (0-5 points)
    if (inputs.shareholdersEquity > 0) {
      const debt = Math.max(0, inputs.totalLiabilities - inputs.shareholdersEquity);
      const debtToEquity = debt / inputs.shareholdersEquity;
      let debtScore = 0;
      if (debtToEquity <= 0.5) debtScore = 5;
      else if (debtToEquity <= 1.0) debtScore = 4;
      else if (debtToEquity <= 2.0) debtScore = 3;
      else if (debtToEquity <= 3.0) debtScore = 2;
      else debtScore = 1;

      factors.debtToEquity = {
        score: debtScore,
        max: 5,
        status: this.getStatus(debtScore, 5),
        value: `${debtToEquity.toFixed(2)}:1`
      };
      score += debtScore;
    }

    return {
      score,
      maxScore: 25,
      factors,
      status: this.getStatus(score, 25)
    };
  }

  private assessMarketOpportunity(inputs: ReadinessInputs): SectionScore {
    let score = 0;
    const factors: Record<string, FactorScore> = {};

    // 1. Market Size (TAM) (0-5 points)
    let tamScore = 0;
    if (inputs.tam >= 100000000000) tamScore = 5; // ≥₹1000 Cr
    else if (inputs.tam >= 50000000000) tamScore = 4; // ≥₹500 Cr
    else if (inputs.tam >= 10000000000) tamScore = 3; // ≥₹100 Cr
    else if (inputs.tam >= 5000000000) tamScore = 2; // ≥₹50 Cr
    else if (inputs.tam > 0) tamScore = 1;

    factors.marketSize = {
      score: tamScore,
      max: 5,
      status: this.getStatus(tamScore, 5),
      value: `₹${(inputs.tam / 10000000).toFixed(0)} Cr`
    };
    score += tamScore;

    // 2. Market Growth Rate (0-5 points)
    let growthScore = 0;
    if (inputs.marketGrowthRate >= 30) growthScore = 5;
    else if (inputs.marketGrowthRate >= 20) growthScore = 4;
    else if (inputs.marketGrowthRate >= 10) growthScore = 3;
    else if (inputs.marketGrowthRate >= 5) growthScore = 2;
    else if (inputs.marketGrowthRate > 0) growthScore = 1;

    factors.marketGrowth = {
      score: growthScore,
      max: 5,
      status: this.getStatus(growthScore, 5),
      value: `${inputs.marketGrowthRate.toFixed(1)}% CAGR`
    };
    score += growthScore;

    // 3. Market Capture Potential (SAM/TAM ratio) (0-5 points)
    const samTamRatio = inputs.sam / inputs.tam;
    let captureScore = 0;
    if (samTamRatio >= 0.3) captureScore = 5;
    else if (samTamRatio >= 0.2) captureScore = 4;
    else if (samTamRatio >= 0.1) captureScore = 3;
    else if (samTamRatio >= 0.05) captureScore = 2;
    else captureScore = 1;

    factors.marketCapture = {
      score: captureScore,
      max: 5,
      status: this.getStatus(captureScore, 5),
      value: `${(samTamRatio * 100).toFixed(1)}% of TAM`
    };
    score += captureScore;

    // 4. Competitive Landscape (0-5 points)
    let competitionScore = 0;
    if (inputs.competitors <= 3) competitionScore = 5; // Few competitors
    else if (inputs.competitors <= 10) competitionScore = 4;
    else if (inputs.competitors <= 20) competitionScore = 3;
    else if (inputs.competitors <= 50) competitionScore = 2;
    else competitionScore = 1;

    factors.competition = {
      score: competitionScore,
      max: 5,
      status: this.getStatus(competitionScore, 5),
      value: `${inputs.competitors} direct competitors`
    };
    score += competitionScore;

    return {
      score,
      maxScore: 20,
      factors,
      status: this.getStatus(score, 20)
    };
  }

  private assessTeamStrength(inputs: ReadinessInputs): SectionScore {
    let score = 0;
    const factors: Record<string, FactorScore> = {};

    // 1. Founder Team Completeness (0-5 points)
    let teamCompleteScore = 0;
    if (inputs.hasTechnicalCofounder && inputs.hasBusinessCofounder) {
      teamCompleteScore = 5;
    } else if (inputs.hasTechnicalCofounder || inputs.hasBusinessCofounder) {
      teamCompleteScore = 3;
    } else {
      teamCompleteScore = 1;
    }

    factors.teamCompleteness = {
      score: teamCompleteScore,
      max: 5,
      status: this.getStatus(teamCompleteScore, 5),
      value: inputs.hasTechnicalCofounder && inputs.hasBusinessCofounder ? 'Complete' : 'Incomplete'
    };
    score += teamCompleteScore;

    // 2. Founder Experience (0-5 points)
    let expScore = 0;
    if (inputs.founderExperience) {
      if (inputs.founderExperience >= 10) expScore = 5;
      else if (inputs.founderExperience >= 7) expScore = 4;
      else if (inputs.founderExperience >= 5) expScore = 3;
      else if (inputs.founderExperience >= 2) expScore = 2;
      else expScore = 1;
    } else {
      expScore = 2; // Default moderate
    }

    factors.founderExperience = {
      score: expScore,
      max: 5,
      status: this.getStatus(expScore, 5),
      value: inputs.founderExperience ? `${inputs.founderExperience} years` : 'Not specified'
    };
    score += expScore;

    // 3. Team Size Appropriateness (0-5 points)
    let sizeScore = 0;
    if (inputs.teamSize >= 20) sizeScore = 5;
    else if (inputs.teamSize >= 10) sizeScore = 4;
    else if (inputs.teamSize >= 5) sizeScore = 3;
    else if (inputs.teamSize >= 3) sizeScore = 2;
    else sizeScore = 1;

    factors.teamSize = {
      score: sizeScore,
      max: 5,
      status: this.getStatus(sizeScore, 5),
      value: `${inputs.teamSize} members`
    };
    score += sizeScore;

    // 4. Advisory Board (0-5 points)
    const advisorScore = Math.min(5, (inputs.advisorsCount || 0) * 1.5);

    factors.advisors = {
      score: advisorScore,
      max: 5,
      status: this.getStatus(advisorScore, 5),
      value: `${inputs.advisorsCount || 0} advisors`
    };
    score += advisorScore;

    return {
      score,
      maxScore: 20,
      factors,
      status: this.getStatus(score, 20)
    };
  }

  private assessTractionExecution(inputs: ReadinessInputs): SectionScore {
    let score = 0;
    const factors: Record<string, FactorScore> = {};

    // 1. Customer Base (0-5 points)
    let customersScore = 0;
    if (inputs.customers >= 10000) customersScore = 5;
    else if (inputs.customers >= 1000) customersScore = 4;
    else if (inputs.customers >= 100) customersScore = 3;
    else if (inputs.customers >= 10) customersScore = 2;
    else if (inputs.customers > 0) customersScore = 1;

    factors.customerBase = {
      score: customersScore,
      max: 5,
      status: this.getStatus(customersScore, 5),
      value: `${inputs.customers} customers`
    };
    score += customersScore;

    // 2. Customer Growth (0-5 points)
    if (inputs.customerGrowthRate !== undefined) {
      let cgScore = 0;
      if (inputs.customerGrowthRate >= 20) cgScore = 5;
      else if (inputs.customerGrowthRate >= 10) cgScore = 4;
      else if (inputs.customerGrowthRate >= 5) cgScore = 3;
      else if (inputs.customerGrowthRate >= 2) cgScore = 2;
      else if (inputs.customerGrowthRate > 0) cgScore = 1;

      factors.customerGrowth = {
        score: cgScore,
        max: 5,
        status: this.getStatus(cgScore, 5),
        value: `${inputs.customerGrowthRate.toFixed(1)}% MoM`
      };
      score += cgScore;
    }

    // 3. Unit Economics (LTV/CAC) (0-5 points)
    if (inputs.ltv && inputs.cac && inputs.cac > 0) {
      const ltvCacRatio = inputs.ltv / inputs.cac;
      let economicsScore = 0;
      if (ltvCacRatio >= 5) economicsScore = 5;
      else if (ltvCacRatio >= 3) economicsScore = 4;
      else if (ltvCacRatio >= 2) economicsScore = 3;
      else if (ltvCacRatio >= 1) economicsScore = 2;
      else economicsScore = 1;

      factors.unitEconomics = {
        score: economicsScore,
        max: 5,
        status: this.getStatus(economicsScore, 5),
        value: `${ltvCacRatio.toFixed(1)}:1`
      };
      score += economicsScore;
    }

    // 4. Retention Rate (0-5 points)
    if (inputs.retentionRate !== undefined) {
      let retentionScore = 0;
      if (inputs.retentionRate >= 90) retentionScore = 5;
      else if (inputs.retentionRate >= 75) retentionScore = 4;
      else if (inputs.retentionRate >= 60) retentionScore = 3;
      else if (inputs.retentionRate >= 40) retentionScore = 2;
      else retentionScore = 1;

      factors.retention = {
        score: retentionScore,
        max: 5,
        status: this.getStatus(retentionScore, 5),
        value: `${inputs.retentionRate.toFixed(1)}%`
      };
      score += retentionScore;
    }

    return {
      score,
      maxScore: 20,
      factors,
      status: this.getStatus(score, 20)
    };
  }

  private assessGovernanceCompliance(inputs: ReadinessInputs): SectionScore {
    let score = 0;
    const factors: Record<string, FactorScore> = {};

    // Each compliance factor worth 3 points
    factors.dpiit = {
      score: inputs.hasDPIIT ? 3 : 0,
      max: 3,
      status: inputs.hasDPIIT ? 'excellent' : 'poor',
      value: inputs.hasDPIIT ? 'Yes' : 'No'
    };
    score += inputs.hasDPIIT ? 3 : 0;

    factors.auditedFinancials = {
      score: inputs.hasAuditedFinancials ? 3 : 0,
      max: 3,
      status: inputs.hasAuditedFinancials ? 'excellent' : 'poor',
      value: inputs.hasAuditedFinancials ? 'Yes' : 'No'
    };
    score += inputs.hasAuditedFinancials ? 3 : 0;

    factors.capTable = {
      score: inputs.hasCompleteCapTable ? 3 : 0,
      max: 3,
      status: inputs.hasCompleteCapTable ? 'excellent' : 'poor',
      value: inputs.hasCompleteCapTable ? 'Complete' : 'Incomplete'
    };
    score += inputs.hasCompleteCapTable ? 3 : 0;

    factors.ipProtection = {
      score: inputs.hasIPProtection ? 3 : 0,
      max: 3,
      status: inputs.hasIPProtection ? 'excellent' : 'moderate',
      value: inputs.hasIPProtection ? 'Yes' : 'No'
    };
    score += inputs.hasIPProtection ? 3 : 0;

    factors.gstCompliance = {
      score: inputs.gstCompliant ? 3 : 0,
      max: 3,
      status: inputs.gstCompliant ? 'excellent' : 'poor',
      value: inputs.gstCompliant ? 'Compliant' : 'Non-compliant'
    };
    score += inputs.gstCompliant ? 3 : 0;

    return {
      score,
      maxScore: 15,
      factors,
      status: this.getStatus(score, 15)
    };
  }

  private identifyRedFlags(inputs: ReadinessInputs, scores: any): RedFlag[] {
    const redFlags: RedFlag[] = [];

    // Financial red flags
    const runway = inputs.monthlyBurnRate > 0 ? inputs.cashInBank / inputs.monthlyBurnRate : 999;
    if (runway < 3) {
      redFlags.push({
        severity: 'critical',
        category: 'financial',
        issue: 'Critical cash runway (<3 months)',
        impact: 'Company may run out of cash soon'
      });
    } else if (runway < 6) {
      redFlags.push({
        severity: 'high',
        category: 'financial',
        issue: 'Low cash runway (<6 months)',
        impact: 'Urgently needs funding'
      });
    }

    // Debt red flag
    if (inputs.shareholdersEquity > 0) {
      const debt = Math.max(0, inputs.totalLiabilities - inputs.shareholdersEquity);
      const debtToEquity = debt / inputs.shareholdersEquity;
      if (debtToEquity > 2) {
        redFlags.push({
          severity: 'high',
          category: 'financial',
          issue: `High debt-to-equity ratio (${debtToEquity.toFixed(2)}:1)`,
          impact: 'May deter equity investors'
        });
      }
    }

    // Team red flags
    if (!inputs.hasTechnicalCofounder && !inputs.hasBusinessCofounder) {
      redFlags.push({
        severity: 'high',
        category: 'team',
        issue: 'Solo founder with no co-founder',
        impact: 'Execution risk and key person dependency'
      });
    }

    // Governance red flags
    if (!inputs.hasDPIIT) {
      redFlags.push({
        severity: 'medium',
        category: 'governance',
        issue: 'No DPIIT recognition',
        impact: 'Ineligible for many government schemes and tax benefits'
      });
    }

    if (!inputs.hasCompleteCapTable) {
      redFlags.push({
        severity: 'high',
        category: 'governance',
        issue: 'Incomplete cap table',
        impact: 'Due diligence will be delayed; ownership unclear'
      });
    }

    return redFlags;
  }

  private generateRecommendations(inputs: ReadinessInputs, scores: any, redFlags: RedFlag[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Address critical red flags first
    redFlags.forEach(flag => {
      if (flag.severity === 'critical' || flag.severity === 'high') {
        if (flag.issue.includes('cash runway')) {
          recommendations.push({
            priority: 'high',
            category: 'financial',
            action: 'Reduce burn rate or secure bridge funding immediately',
            expectedImpact: 'Extends runway, reduces immediate risk',
            timeframe: '1-2 months'
          });
        }
        if (flag.issue.includes('debt-to-equity')) {
          recommendations.push({
            priority: 'high',
            category: 'financial',
            action: 'Refinance debt or convert to equity',
            expectedImpact: '+3 points on financial health score',
            timeframe: '2-3 months'
          });
        }
        if (flag.issue.includes('cap table')) {
          recommendations.push({
            priority: 'high',
            category: 'governance',
            action: 'Complete and organize cap table documentation',
            expectedImpact: '+3 points on governance score',
            timeframe: '2-4 weeks'
          });
        }
      }
    });

    // Improvement recommendations based on scores
    if (scores.teamStrength.score < 12) {
      if (!inputs.advisorsCount || inputs.advisorsCount < 2) {
        recommendations.push({
          priority: 'medium',
          category: 'team',
          action: 'Add 2-3 industry advisors to strengthen team',
          expectedImpact: '+3-5 points on team strength',
          timeframe: '1-2 months'
        });
      }
    }

    if (!inputs.hasDPIIT) {
      recommendations.push({
        priority: 'medium',
        category: 'governance',
        action: 'Apply for DPIIT startup recognition',
        expectedImpact: '+3 points, unlocks government schemes',
        timeframe: '1 month'
      });
    }

    return recommendations;
  }

  private categorizeReadiness(score: number, redFlags: RedFlag[]): 'not_ready' | 'needs_improvement' | 'moderate' | 'ready' | 'highly_ready' {
    // Critical red flags override score
    if (redFlags.some(f => f.severity === 'critical')) {
      return 'not_ready';
    }

    if (score >= 80 && redFlags.filter(f => f.severity === 'high').length === 0) {
      return 'highly_ready';
    } else if (score >= 65) {
      return 'ready';
    } else if (score >= 50) {
      return 'moderate';
    } else if (score >= 35) {
      return 'needs_improvement';
    } else {
      return 'not_ready';
    }
  }

  private estimateTimeToReady(score: number, redFlags: RedFlag[], recommendations: Recommendation[]): string {
    if (score >= 65) {
      return 'Ready now';
    }

    const highPriorityActions = recommendations.filter(r => r.priority === 'high').length;
    const criticalFlags = redFlags.filter(f => f.severity === 'critical').length;

    if (criticalFlags > 0) {
      return '6-9 months (critical issues to address)';
    } else if (highPriorityActions >= 3) {
      return '4-6 months';
    } else if (score >= 50) {
      return '2-3 months';
    } else {
      return '3-6 months';
    }
  }

  private getStatus(score: number, max: number): 'poor' | 'needs_improvement' | 'moderate' | 'good' | 'excellent' {
    const percentage = (score / max) * 100;
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'moderate';
    if (percentage >= 30) return 'needs_improvement';
    return 'poor';
  }
}
