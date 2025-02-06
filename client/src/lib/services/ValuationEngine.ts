import { getMarketInsights, validateFinancialMetrics } from "./ai-service";

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
  // Dynamic industry multipliers updated based on market conditions
  private static async getIndustryMultipliers(industry: string) {
    try {
      const marketData = await getMarketInsights(industry, "all");
      return {
        revenue: marketData.metrics.revenueMultiple || 10,
        users: marketData.metrics.userMultiple || 500,
        growth: marketData.metrics.growthMultiple || 1.5
      };
    } catch (error) {
      console.error("Error fetching market multipliers:", error);
      return {
        revenue: 10,
        users: 500,
        growth: 1.5
      };
    }
  }

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

  static async calculateValuation(data: any, aiInsights: any): Promise<ValuationResult> {
    // Get dynamic industry multipliers
    const industryMultipliers = await this.getIndustryMultipliers(data.basicInfo.industry);

    // Calculate different valuation methods with dynamic multipliers
    const scorecardValue = await this.calculateScorecardValue(data, industryMultipliers);
    const riskAdjustedValue = await this.calculateRiskAdjustedValue(data);
    const vcValue = await this.calculateVCValue(data, industryMultipliers);
    const dcfValue = await this.calculateDCFValue(data);
    const comparablesValue = await this.calculateComparablesValue(data, industryMultipliers);

    // Calculate industry benchmarks with real-time data
    const benchmarks = await this.calculateIndustryBenchmarks(data);

    // Perform comprehensive risk analysis
    const riskAnalysis = await this.performRiskAnalysis(data);

    // Calculate confidence based on data quality and market conditions
    const confidence = await this.calculateConfidenceScore(data, [
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

  private static async calculateScorecardValue(data: any, industryMultipliers: any): Promise<number> {
    const weights = {
      team: 0.30,
      marketSize: 0.25,
      technology: 0.15,
      competition: 0.10,
      traction: 0.10,
      businessModel: 0.10
    };

    // Validate metrics before calculation
    const validationResult = await validateFinancialMetrics(data);
    if (!validationResult.isValid) {
      console.warn("Financial metrics validation warnings:", validationResult.feedback);
    }

    let score = 0;

    // Enhanced team score calculation
    score += weights.team * (data.basicInfo.founderExperience / 10);

    // Market size score with TAM validation
    const tamScore = Math.min(data.marketMetrics.marketSize.tam / 1000000000, 10);
    score += weights.marketSize * (tamScore / 10);

    // Technology readiness score
    score += weights.technology * (data.marketMetrics.solutionReadiness / 100);

    // Competition analysis
    const competitorShare = data.competitive.competitors.reduce(
      (acc: number, comp: any) => acc + (comp.marketShare || 0), 
      0
    );
    score += weights.competition * ((100 - competitorShare) / 100);

    // Apply industry and stage multipliers
    const stageMultiplier = this.STAGE_MULTIPLIERS[data.basicInfo.stage as keyof typeof ValuationEngine.STAGE_MULTIPLIERS] || 1;

    return 2500000 * score * industryMultipliers.revenue * stageMultiplier;
  }

  private static async calculateRiskAdjustedValue(data: any): Promise<number> {
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

    // Enhanced risk calculations
    const managementScore = await this.calculateManagementRisk(data);
    const stageScore = this.calculateStageRisk(data.basicInfo.stage);
    const techScore = data.marketMetrics.solutionReadiness / 100;
    const competitionScore = 1 - (await this.calculateCompetitionIntensity(data.competitive)) / 100;
    const fundingScore = data.financials.runwayMonths > 12 ? 0.8 : 0.5;

    riskScore += managementScore * 0.20;
    riskScore += stageScore * 0.15;
    riskScore += techScore * 0.15;
    riskScore += competitionScore * 0.10;
    riskScore += fundingScore * 0.10;

    return baseValue * (1 + riskScore);
  }

  private static async calculateDCFValue(data: any): Promise<number> {
    const projectionYears = 5;
    const wacc = await this.calculateWACC(data);
    let dcfValue = 0;

    // Enhanced cash flow projections
    for (let year = 1; year <= projectionYears; year++) {
      const growthRate = Math.max(0.1, data.marketMetrics.marketGrowth / 100);
      const projectedRevenue = data.financials.projectedRevenue * Math.pow(1 + growthRate, year);
      const margin = await this.calculateProjectedMargin(data, year);
      const freeCashFlow = projectedRevenue * margin;

      dcfValue += freeCashFlow / Math.pow(1 + wacc, year);
    }

    // Terminal value calculation
    const terminalGrowthRate = 0.03;
    const terminalValue = (dcfValue * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);
    dcfValue += terminalValue / Math.pow(1 + wacc, projectionYears);

    return dcfValue;
  }

  private static async calculateVCValue(data: any, industryMultipliers: any): Promise<number> {
    const exitYear = 5;
    const targetROI = await this.calculateTargetROI(data);
    const projectedRevenue = data.financials.projectedRevenue;

    const terminalValue = projectedRevenue * industryMultipliers.revenue;
    const presentValue = terminalValue / Math.pow(targetROI, exitYear);

    return presentValue;
  }

  private static async calculateComparablesValue(data: any, industryMultipliers: any): Promise<number> {
    // Enhanced comparables analysis
    const revenueValue = data.financials.projectedRevenue * industryMultipliers.revenue;
    const userValue = (data.metrics?.activeUsers || 0) * industryMultipliers.users;

    const marketGrowthAdjustment = 1 + (data.marketMetrics.marketGrowth / 100 * industryMultipliers.growth);
    const growthAdjustedValue = revenueValue * marketGrowthAdjustment;

    return (revenueValue + userValue + growthAdjustedValue) / 3;
  }

  // Helper methods with enhanced calculations
  private static async calculateWACC(data: any): Promise<number> {
    const riskFreeRate = 0.03; // Treasury rate
    const marketRiskPremium = 0.06;
    const beta = await this.calculateIndustryBeta(data.basicInfo.industry);

    return riskFreeRate + beta * marketRiskPremium;
  }

  private static async calculateProjectedMargin(data: any, year: number): Promise<number> {
    const baseMargin = 0.15;
    const scaleEfficiency = Math.min(0.05 * year, 0.15); // Max 15% improvement
    return baseMargin + scaleEfficiency;
  }

  private static async calculateTargetROI(data: any): Promise<number> {
    const baseROI = 10;
    const riskPremium = await this.calculateRiskPremium(data);
    return baseROI + riskPremium;
  }

  private static async calculateIndustryBeta(industry: string): Promise<number> {
    const marketData = await getMarketInsights(industry, "all");
    return marketData.metrics.beta || 1.2;
  }

  private static async calculateRiskPremium(data: any): Promise<number> {
    const riskAnalysis = await this.performRiskAnalysis(data);
    return Math.max(0, (riskAnalysis.overallRisk - 0.5) * 10);
  }

  private static async calculateManagementRisk(data: any): Promise<number> {
    return data.basicInfo.founderExperience / 10;
  }

  private static async calculateCompetitionIntensity(competitive: any): Promise<number> {
    return competitive.competitors.reduce(
      (acc: number, comp: any) => acc + (comp.marketShare || 0), 
      0
    );
  }

  private static calculateStageRisk(stage: string): number {
    return this.STAGE_MULTIPLIERS[stage as keyof typeof ValuationEngine.STAGE_MULTIPLIERS] || 0.5;
  }

  private static async calculateIndustryBenchmarks(data: any): Promise<any> {
    const industryMetrics = await this.getIndustryMultipliers(data.basicInfo.industry);
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
          valuation: await this.calculateComparablesValue(data, industryMetrics),
          multiple: industryMetrics.revenue
        }
      ]
    };
  }

  private static async performRiskAnalysis(data: any): Promise<any> {
    const riskFactors = [
      {
        name: "Market Risk",
        score: await this.calculateMarketRisk(data),
        impact: this.determineImpact(await this.calculateMarketRisk(data))
      },
      {
        name: "Execution Risk",
        score: await this.calculateExecutionRisk(data),
        impact: this.determineImpact(await this.calculateExecutionRisk(data))
      },
      {
        name: "Financial Risk",
        score: await this.calculateFinancialRisk(data),
        impact: this.determineImpact(await this.calculateFinancialRisk(data))
      },
      {
        name: "Competition Risk",
        score: await this.calculateCompetitionRisk(data),
        impact: this.determineImpact(await this.calculateCompetitionRisk(data))
      }
    ];

    const overallRisk = riskFactors.reduce((acc, factor) => acc + factor.score, 0) / riskFactors.length;

    return {
      factors: riskFactors,
      overallRisk
    };
  }

  private static async calculateConfidenceScore(data: any, valuations: number[]): Promise<number> {
    const variance = await this.calculateVariance(valuations);
    const dataCompleteness = this.assessDataCompleteness(data);
    const marketValidation = data.marketMetrics.marketResearchScore / 100;

    return (1 - variance) * 0.4 + dataCompleteness * 0.3 + marketValidation * 0.3;
  }


  // Helper methods for risk calculations.  Many are now async.
  private static async calculateMarketRisk(data: any): Promise<number> {
    return 1 - (data.marketMetrics.marketResearchScore / 100);
  }

  private static async calculateExecutionRisk(data: any): Promise<number> {
    return 1 - (data.basicInfo.founderExperience / 10);
  }

  private static async calculateFinancialRisk(data: any): Promise<number> {
    return data.financials.runwayMonths < 12 ? 0.8 : 0.4;
  }

  private static async calculateCompetitionRisk(data: any): Promise<number> {
    return (await this.calculateCompetitionIntensity(data.competitive)) / 100;
  }

  private static determineImpact(score: number): 'low' | 'medium' | 'high' {
    if (score < 0.3) return 'low';
    if (score < 0.7) return 'medium';
    return 'high';
  }

  private static async calculateVariance(values: number[]): Promise<number> {
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
}