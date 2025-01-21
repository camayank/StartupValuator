interface ValuationResult {
  methods: {
    scorecard: number;
    riskAdjusted: number;
    vc: number;
  };
  range: {
    low: number;
    high: number;
  };
  aiInsights: any;
}

export class ValuationEngine {
  private static readonly AVERAGE_SEED_VALUATION = 2500000;
  private static readonly INDUSTRY_MULTIPLIERS = {
    software_enterprise: 12,
    software_consumer: 10,
    ai_ml: 15,
    biotech: 8,
    fintech: 11
  };

  static calculateValuation(data: any, aiInsights: any): ValuationResult {
    // Scorecard Method
    const scorecardValue = this.calculateScorecardValue(data);
    
    // Risk Factor Summation
    const riskAdjustedValue = this.calculateRiskAdjustedValue(data);
    
    // Venture Capital Method
    const vcValue = this.calculateVCValue(data);

    return {
      methods: {
        scorecard: scorecardValue,
        riskAdjusted: riskAdjustedValue,
        vc: vcValue
      },
      range: {
        low: Math.min(scorecardValue, riskAdjustedValue, vcValue),
        high: Math.max(scorecardValue, riskAdjustedValue, vcValue)
      },
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
    
    // Competition Score (inverse of market share of competitors)
    const totalCompetitorShare = data.competitive.competitors.reduce(
      (acc: number, comp: any) => acc + (comp.marketShare || 0), 
      0
    );
    score += weights.competition * ((100 - totalCompetitorShare) / 100);
    
    // Apply industry multiplier
    const industryMultiplier = this.INDUSTRY_MULTIPLIERS[data.basicInfo.industry as keyof typeof ValuationEngine.INDUSTRY_MULTIPLIERS] || 10;
    
    return this.AVERAGE_SEED_VALUATION * score * industryMultiplier;
  }

  private static calculateRiskAdjustedValue(data: any): number {
    const baseValue = this.AVERAGE_SEED_VALUATION;
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

    // Calculate risk scores based on data
    riskScore += this.calculateRiskScore('Management', data.basicInfo.founderExperience) * 0.20;
    riskScore += this.calculateStageRiskScore(data.basicInfo.stage) * 0.15;
    riskScore += (data.marketMetrics.solutionReadiness / 100) * 0.15;
    riskScore += ((100 - this.calculateCompetitionIntensity(data.competitive)) / 100) * 0.10;
    riskScore += (data.financials.runwayMonths > 12 ? 0.8 : 0.5) * 0.10;

    return baseValue * (1 + riskScore);
  }

  private static calculateVCValue(data: any): number {
    const exitYear = 5; // Standard VC exit timeframe
    const targetROI = 10; // 10x return
    const projectedRevenue = data.financials.projectedRevenue;
    const industryMultiple = this.INDUSTRY_MULTIPLIERS[data.basicInfo.industry as keyof typeof ValuationEngine.INDUSTRY_MULTIPLIERS] || 10;
    
    // Calculate terminal value
    const terminalValue = projectedRevenue * industryMultiple;
    
    // Calculate present value using target ROI
    const presentValue = terminalValue / Math.pow(targetROI, exitYear);
    
    return presentValue;
  }

  private static calculateRiskScore(factor: string, value: number): number {
    // Normalize value to 0-1 range based on factor type
    switch (factor) {
      case 'Management':
        return Math.min(value / 10, 1);
      default:
        return 0.5; // Default middle score
    }
  }

  private static calculateStageRiskScore(stage: string): number {
    const stageScores: Record<string, number> = {
      ideation_unvalidated: 0.2,
      ideation_validated: 0.3,
      mvp_development: 0.4,
      mvp_early_traction: 0.5,
      beta_testing: 0.6,
      revenue_early: 0.7,
      revenue_growing: 0.8,
      revenue_scaling: 0.9
    };
    
    return stageScores[stage] || 0.5;
  }

  private static calculateCompetitionIntensity(competitive: any): number {
    return competitive.competitors.reduce(
      (acc: number, comp: any) => acc + (comp.marketShare || 0), 
      0
    );
  }
}
