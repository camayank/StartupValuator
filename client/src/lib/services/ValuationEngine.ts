interface ValuationResult {
  methods: {
    scorecard: number;
    riskAdjusted: number;
    vc: number;
    dcf: number;
    comparables: number;
  };
  range: {
    low: number;
    high: number;
    confidence: number;
  };
  benchmarks: {
    industry: {
      revenueMultiple: number;
      userMultiple: number;
      growthRate: number;
    };
    comparable: Array<{
      name: string;
      valuation: number;
      multiple: number;
    }>;
  };
  riskAnalysis: {
    factors: Array<{
      name: string;
      score: number;
      impact: 'low' | 'medium' | 'high';
      mitigation?: string;
    }>;
    overallRisk: number;
  };
  aiInsights: any;
}

export class ValuationEngine {
  private static readonly INDUSTRY_MULTIPLIERS = {
    software_enterprise: { revenue: 12, users: 500, growth: 1.5 },
    software_consumer: { revenue: 10, users: 200, growth: 1.3 },
    ai_ml: { revenue: 15, users: 800, growth: 2.0 },
    biotech: { revenue: 8, users: 1000, growth: 1.8 },
    fintech: { revenue: 11, users: 300, growth: 1.4 },
    healthtech: { revenue: 9, users: 400, growth: 1.6 },
    ecommerce: { revenue: 7, users: 150, growth: 1.2 },
    saas: { revenue: 13, users: 600, growth: 1.7 }
  };

  private static readonly STAGE_MULTIPLIERS = {
    ideation_unvalidated: 0.2,
    ideation_validated: 0.4,
    mvp_development: 0.6,
    mvp_early_traction: 0.8,
    beta_testing: 1.0,
    revenue_early: 1.2,
    revenue_growing: 1.5,
    revenue_scaling: 2.0
  };

  static calculateValuation(data: any, aiInsights: any): ValuationResult {
    // Calculate different valuation methods
    const scorecardValue = this.calculateScorecardValue(data);
    const riskAdjustedValue = this.calculateRiskAdjustedValue(data);
    const vcValue = this.calculateVCValue(data);
    const dcfValue = this.calculateDCFValue(data);
    const comparablesValue = this.calculateComparablesValue(data);

    // Calculate industry benchmarks
    const benchmarks = this.calculateIndustryBenchmarks(data);

    // Perform risk analysis
    const riskAnalysis = this.performRiskAnalysis(data);

    // Calculate confidence based on data quality and consistency
    const confidence = this.calculateConfidenceScore(data, [
      scorecardValue,
      riskAdjustedValue,
      vcValue,
      dcfValue,
      comparablesValue
    ]);

    return {
      methods: {
        scorecard: scorecardValue,
        riskAdjusted: riskAdjustedValue,
        vc: vcValue,
        dcf: dcfValue,
        comparables: comparablesValue
      },
      range: {
        low: Math.min(scorecardValue, riskAdjustedValue, vcValue, dcfValue, comparablesValue),
        high: Math.max(scorecardValue, riskAdjustedValue, vcValue, dcfValue, comparablesValue),
        confidence
      },
      benchmarks,
      riskAnalysis,
      aiInsights
    };
  }

  private static calculateScorecardValue(data: any): number {
    const weights = {
      team: 0.30,
      marketSize: 0.25,
      technology: 0.15,
      competition: 0.10,
      traction: 0.10,
      businessModel: 0.10
    };

    let score = 0;

    // Team Score
    score += weights.team * (data.basicInfo.founderExperience / 10);

    // Market Size Score
    const tamScore = Math.min(data.marketMetrics.marketSize.tam / 1000000000, 10);
    score += weights.marketSize * (tamScore / 10);

    // Technology Score
    score += weights.technology * (data.marketMetrics.solutionReadiness / 100);

    // Competition Score
    const totalCompetitorShare = data.competitive.competitors.reduce(
      (acc: number, comp: any) => acc + (comp.marketShare || 0), 
      0
    );
    score += weights.competition * ((100 - totalCompetitorShare) / 100);

    // Industry & Stage Adjustments
    const industryMultiplier = this.INDUSTRY_MULTIPLIERS[data.basicInfo.industry as keyof typeof ValuationEngine.INDUSTRY_MULTIPLIERS]?.revenue || 10;
    const stageMultiplier = this.STAGE_MULTIPLIERS[data.basicInfo.stage as keyof typeof ValuationEngine.STAGE_MULTIPLIERS] || 1;

    return 2500000 * score * industryMultiplier * stageMultiplier;
  }

  private static calculateRiskAdjustedValue(data: any): number {
    const baseValue = 2500000;
    const riskFactors = [
      { name: 'Management', weight: 0.20 },
      { name: 'Stage', weight: 0.15 },
      { name: 'Technology', weight: 0.15 },
      { name: 'Competition', weight: 0.10 },
      { name: 'Manufacturing', weight: 0.10 },
      { name: 'Sales/Marketing', weight: 0.10 },
      { name: 'Funding/Capital', weight: 0.10 },
      { name: 'Legal/Regulatory', weight: 0.10 }
    ];

    let riskScore = 0;
    riskScore += this.calculateRiskScore('Management', data.basicInfo.founderExperience) * 0.20;
    riskScore += this.calculateStageRiskScore(data.basicInfo.stage) * 0.15;
    riskScore += (data.marketMetrics.solutionReadiness / 100) * 0.15;
    riskScore += ((100 - this.calculateCompetitionIntensity(data.competitive)) / 100) * 0.10;
    riskScore += (data.financials.runwayMonths > 12 ? 0.8 : 0.5) * 0.10;

    return baseValue * (1 + riskScore);
  }

  private static calculateDCFValue(data: any): number {
    const projectionYears = 5;
    const wacc = 0.15; // Weighted Average Cost of Capital
    let dcfValue = 0;

    // Project cash flows
    for (let year = 1; year <= projectionYears; year++) {
      const growthRate = Math.max(0.1, data.marketMetrics.marketGrowth / 100);
      const projectedRevenue = data.financials.projectedRevenue * Math.pow(1 + growthRate, year);
      const projectedMargin = 0.15; // Assumed margin
      const freeCashFlow = projectedRevenue * projectedMargin;

      dcfValue += freeCashFlow / Math.pow(1 + wacc, year);
    }

    // Terminal value
    const terminalGrowthRate = 0.03;
    const terminalValue = (dcfValue * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);
    dcfValue += terminalValue / Math.pow(1 + wacc, projectionYears);

    return dcfValue;
  }

  private static calculateVCValue(data: any): number {
    const exitYear = 5;
    const targetROI = 10;
    const projectedRevenue = data.financials.projectedRevenue;
    const industryMultiple = this.INDUSTRY_MULTIPLIERS[data.basicInfo.industry as keyof typeof ValuationEngine.INDUSTRY_MULTIPLIERS]?.revenue || 10;

    const terminalValue = projectedRevenue * industryMultiple;
    const presentValue = terminalValue / Math.pow(targetROI, exitYear);

    return presentValue;
  }

  private static calculateComparablesValue(data: any): number {
    // Implement comparables analysis using industry benchmarks
    const industryMetrics = this.INDUSTRY_MULTIPLIERS[data.basicInfo.industry as keyof typeof ValuationEngine.INDUSTRY_MULTIPLIERS];
    if (!industryMetrics) return 0;

    const revenueValue = data.financials.projectedRevenue * industryMetrics.revenue;
    const userValue = (data.metrics?.activeUsers || 0) * industryMetrics.users;
    const growthAdjustedValue = revenueValue * (1 + (data.marketMetrics.marketGrowth / 100 * industryMetrics.growth));

    return (revenueValue + userValue + growthAdjustedValue) / 3;
  }

  private static calculateIndustryBenchmarks(data: any): any {
    const industryMetrics = this.INDUSTRY_MULTIPLIERS[data.basicInfo.industry as keyof typeof ValuationEngine.INDUSTRY_MULTIPLIERS];
    if (!industryMetrics) return {};

    return {
      industry: {
        revenueMultiple: industryMetrics.revenue,
        userMultiple: industryMetrics.users,
        growthRate: data.marketMetrics.marketGrowth
      },
      comparable: [
        {
          name: "Industry Average",
          valuation: this.calculateComparablesValue(data),
          multiple: industryMetrics.revenue
        }
      ]
    };
  }

  private static performRiskAnalysis(data: any): any {
    const riskFactors = [
      {
        name: "Market Risk",
        score: this.calculateMarketRisk(data),
        impact: this.determineImpact(this.calculateMarketRisk(data))
      },
      {
        name: "Execution Risk",
        score: this.calculateExecutionRisk(data),
        impact: this.determineImpact(this.calculateExecutionRisk(data))
      },
      {
        name: "Financial Risk",
        score: this.calculateFinancialRisk(data),
        impact: this.determineImpact(this.calculateFinancialRisk(data))
      },
      {
        name: "Competition Risk",
        score: this.calculateCompetitionRisk(data),
        impact: this.determineImpact(this.calculateCompetitionRisk(data))
      }
    ];

    const overallRisk = riskFactors.reduce((acc, factor) => acc + factor.score, 0) / riskFactors.length;

    return {
      factors: riskFactors,
      overallRisk
    };
  }

  private static calculateConfidenceScore(data: any, valuations: number[]): number {
    const variance = this.calculateVariance(valuations);
    const dataCompleteness = this.assessDataCompleteness(data);
    const marketValidation = data.marketMetrics.marketResearchScore / 100;

    return (1 - variance) * 0.4 + dataCompleteness * 0.3 + marketValidation * 0.3;
  }

  // Helper methods for risk calculations
  private static calculateMarketRisk(data: any): number {
    return 1 - (data.marketMetrics.marketResearchScore / 100);
  }

  private static calculateExecutionRisk(data: any): number {
    return 1 - (data.basicInfo.founderExperience / 10);
  }

  private static calculateFinancialRisk(data: any): number {
    return data.financials.runwayMonths < 12 ? 0.8 : 0.4;
  }

  private static calculateCompetitionRisk(data: any): number {
    return this.calculateCompetitionIntensity(data.competitive) / 100;
  }

  private static determineImpact(score: number): 'low' | 'medium' | 'high' {
    if (score < 0.3) return 'low';
    if (score < 0.7) return 'medium';
    return 'high';
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.min(variance / Math.pow(mean, 2), 1);
  }

  private static assessDataCompleteness(data: any): number {
    const requiredFields = [
      'basicInfo.name',
      'basicInfo.industry',
      'basicInfo.stage',
      'financials.projectedRevenue',
      'marketMetrics.marketSize',
      'marketMetrics.marketGrowth'
    ];

    const completedFields = requiredFields.filter(field => {
      const parts = field.split('.');
      let value = data;
      for (const part of parts) {
        value = value?.[part];
        if (value === undefined) return false;
      }
      return true;
    });

    return completedFields.length / requiredFields.length;
  }

  private static calculateRiskScore(factor: string, value: number): number {
    return Math.min(value / 10, 1);
  }

  private static calculateStageRiskScore(stage: string): number {
    return this.STAGE_MULTIPLIERS[stage as keyof typeof ValuationEngine.STAGE_MULTIPLIERS] || 0.5;
  }

  private static calculateCompetitionIntensity(competitive: any): number {
    return competitive.competitors.reduce(
      (acc: number, comp: any) => acc + (comp.marketShare || 0), 
      0
    );
  }
}