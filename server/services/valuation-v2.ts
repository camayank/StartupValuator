import type { ValuationFormData } from "../../client/src/lib/validations";

/**
 * Valuation Calculator V2
 * 
 * Implements industry-standard valuation methods:
 * 1. Scorecard Method - Compares startup to median pre-money valuations
 * 2. Risk Factor Summation - Adjusts base value by risk/reward factors  
 * 3. Venture Capital Method - DCF-based with realistic exit multiples
 * 
 * India-optimized with realistic benchmarks for Indian startup ecosystem
 */

// India-specific base valuations (median pre-money by stage, in INR)
const INDIA_BASE_VALUATIONS_INR: Record<string, number> = {
  "Pre-seed / Idea Stage": 20000000, // ₹2 Cr
  "Seed Stage": 50000000, // ₹5 Cr  
  "Series A": 150000000, // ₹15 Cr
  "Series B": 400000000, // ₹40 Cr
  "Series C+": 1000000000, // ₹100 Cr
  "Revenue-generating (No funding yet)": 30000000 // ₹3 Cr
};

// Currency conversion rates (approximate, should be fetched from API in production)
const CURRENCY_TO_INR: Record<string, number> = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 105
};

// Scorecard factors with proper weights (industry standard)
interface ScorecardFactor {
  weight: number;
  minScore: number;
  maxScore: number;
}

const SCORECARD_FACTORS: Record<string, ScorecardFactor> = {
  strengthOfTeam: { weight: 0.30, minScore: 0, maxScore: 150 }, // Most important
  sizeOfOpportunity: { weight: 0.25, minScore: 0, maxScore: 150 },
  productTechnology: { weight: 0.15, minScore: 0, maxScore: 150 },
  competitiveEnvironment: { weight: 0.10, minScore: 0, maxScore: 150 },
  marketing: { weight: 0.10, minScore: 0, maxScore: 150 },
  needForFunding: { weight: 0.05, minScore: 0, maxScore: 150 },
  otherFactors: { weight: 0.05, minScore: 0, maxScore: 150 }
};

// Risk factors that can ADD or SUBTRACT value
interface RiskFactor {
  weight: number;
  range: [number, number]; // -2 to +2 for subtract/add value
}

const RISK_FACTORS: Record<string, RiskFactor> = {
  managementRisk: { weight: 0.25, range: [-2, 2] },
  stageOfBusiness: { weight: 0.20, range: [-2, 2] },
  legislationPolitical: { weight: 0.10, range: [-2, 2] },
  manufacturingRisk: { weight: 0.10, range: [-2, 2] },
  salesMarketingRisk: { weight: 0.15, range: [-2, 2] },
  fundingCapitalRaising: { weight: 0.10, range: [-2, 2] },
  competitionRisk: { weight: 0.10, range: [-2, 2] }
};

export class ValuationCalculatorV2 {
  
  /**
   * Main entry point - calculates valuation using multiple methods
   */
  public calculateValuation(data: ValuationFormData, currency: string = "INR") {
    try {
      // Handle pre-revenue case
      const isPreRevenue = !data.financialData.revenue || data.financialData.revenue === 0;
      
      // Calculate using three methods
      const scorecardResult = this.calculateScorecardMethod(data, currency);
      const riskFactorResult = this.calculateRiskFactorMethod(data, currency);
      const vcResult = isPreRevenue ? 
        this.calculatePreRevenueVC(data, currency) : 
        this.calculateVCMethod(data, currency);
      
      // Calculate weighted average (adjust weights based on stage)
      const weights = this.determineMethodWeights(data, isPreRevenue);
      
      const weightedValuation = 
        (scorecardResult.value * weights.scorecard) +
        (riskFactorResult.value * weights.riskFactor) +
        (vcResult.value * weights.vc);
      
      // Calculate confidence based on data completeness and method agreement
      const confidence = this.calculateConfidence(
        scorecardResult.value,
        riskFactorResult.value,
        vcResult.value,
        data
      );
      
      return {
        valuation: Math.round(weightedValuation),
        methodologies: {
          scorecard: Math.round(scorecardResult.value),
          riskFactor: Math.round(riskFactorResult.value),
          vc: Math.round(vcResult.value)
        },
        range: {
          low: Math.round(weightedValuation * 0.7),
          high: Math.round(weightedValuation * 1.4)
        },
        confidence,
        factors: this.getValuationDrivers(data),
        metadata: {
          isPreRevenue,
          currency,
          methodWeights: weights,
          scorecardDetails: scorecardResult.details,
          riskFactorDetails: riskFactorResult.details,
          disclaimers: this.getDisclaimers()
        }
      };
    } catch (error) {
      console.error('Valuation calculation error:', error);
      throw error;
    }
  }
  
  /**
   * Scorecard Method - Industry Standard Implementation
   * Compares startup to median pre-money valuation with factor adjustments
   */
  private calculateScorecardMethod(data: ValuationFormData, currency: string) {
    const stage = data.businessInfo.productStage || "Seed Stage";
    const baseValuation = INDIA_BASE_VALUATIONS_INR[stage] || INDIA_BASE_VALUATIONS_INR["Seed Stage"];
    
    // Calculate scores for each factor (0-150% where 100% is average)
    const scores = {
      strengthOfTeam: this.scoreTeam(data),
      sizeOfOpportunity: this.scoreOpportunity(data),
      productTechnology: this.scoreTechnology(data),
      competitiveEnvironment: this.scoreCompetition(data),
      marketing: this.scoreMarketing(data),
      needForFunding: this.scoreFunding(data),
      otherFactors: 100 // Default to average
    };
    
    // Calculate weighted average (in percentage terms)
    let totalAdjustment = 0;
    Object.entries(SCORECARD_FACTORS).forEach(([factor, config]) => {
      const score = scores[factor as keyof typeof scores];
      totalAdjustment += (score / 100) * config.weight;
    });
    
    const adjustedValuation = baseValuation * totalAdjustment;
    const convertedValue = this.convertFromINR(adjustedValuation, currency);
    
    return {
      value: convertedValue,
      details: { baseValuation, totalAdjustment, scores }
    };
  }
  
  /**
   * Risk Factor Summation Method - Proper Implementation
   * Can ADD or SUBTRACT value based on risk/reward factors
   */
  private calculateRiskFactorMethod(data: ValuationFormData, currency: string) {
    const stage = data.businessInfo.productStage || "Seed Stage";
    const baseValuation = INDIA_BASE_VALUATIONS_INR[stage] || INDIA_BASE_VALUATIONS_INR["Seed Stage"];
    
    // Assess each risk factor (-2 to +2)
    const riskScores = {
      managementRisk: this.assessManagementRisk(data),
      stageOfBusiness: this.assessStageRisk(data),
      legislationPolitical: this.assessLegislationRisk(data),
      manufacturingRisk: this.assessManufacturingRisk(data),
      salesMarketingRisk: this.assessSalesRisk(data),
      fundingCapitalRaising: this.assessFundingRisk(data),
      competitionRisk: this.assessCompetitionRisk(data)
    };
    
    // Calculate total risk adjustment
    let totalRiskAdjustment = 0;
    Object.entries(RISK_FACTORS).forEach(([factor, config]) => {
      const score = riskScores[factor as keyof typeof riskScores];
      totalRiskAdjustment += score * config.weight;
    });
    
    // Apply adjustment: -2 means 50% reduction, +2 means 50% increase
    const adjustmentMultiplier = 1 + (totalRiskAdjustment * 0.25);
    const adjustedValuation = baseValuation * adjustmentMultiplier;
    const convertedValue = this.convertFromINR(adjustedValuation, currency);
    
    return {
      value: convertedValue,
      details: { baseValuation, totalRiskAdjustment, riskScores }
    };
  }
  
  /**
   * Venture Capital Method - DCF Based
   * Post-money valuation based on exit value and required ROI
   */
  private calculateVCMethod(data: ValuationFormData, currency: string) {
    // Revenue is already in user's chosen currency, convert to INR for calculations
    const currentRevenueINR = this.convertToINR(data.financialData.revenue, currency);
    const growthRate = data.marketData.growthRate / 100 || 0.5; // Default 50% if not provided
    const year5RevenueINR = currentRevenueINR * Math.pow(1 + growthRate, 5);
    
    // Determine exit multiple based on industry and margins
    const exitMultiple = this.getExitMultiple(data);
    const exitValueINR = year5RevenueINR * exitMultiple;
    
    // Required ROI (decimal form) - typically 25-40% for VCs
    const requiredROI = (data.valuationInputs?.expectedROI || 30) / 100;
    
    // Present value calculation (in INR)
    const presentValueINR = exitValueINR / Math.pow(1 + requiredROI, 5);
    
    // Convert back to user's currency
    const convertedValue = this.convertFromINR(presentValueINR, currency);
    
    return {
      value: convertedValue,
      details: { 
        currentRevenue: data.financialData.revenue, 
        year5Revenue: this.convertFromINR(year5RevenueINR, currency), 
        exitMultiple, 
        exitValue: this.convertFromINR(exitValueINR, currency), 
        requiredROI 
      }
    };
  }
  
  /**
   * Pre-revenue valuation (for idea/concept stage)
   */
  private calculatePreRevenueVC(data: ValuationFormData, currency: string) {
    const stage = data.businessInfo.productStage || "Pre-seed / Idea Stage";
    const baseValuation = INDIA_BASE_VALUATIONS_INR[stage];
    
    // Adjust based on team, technology, and market size
    let multiplier = 1.0;
    
    // Team quality boost (0.8x to 1.5x)
    if (data.teamData?.size && data.teamData.size > 3) {
      multiplier *= 1.2;
    }
    
    // Technology/IP boost
    if (data.productDetails?.maturity === "prototype" || data.productDetails?.maturity === "production") {
      multiplier *= 1.3;
    }
    
    // Market size boost
    if (data.marketData?.tam && data.marketData.tam > 10000000000) { // >$10B TAM
      multiplier *= 1.2;
    }
    
    const adjustedValuation = baseValuation * multiplier;
    const convertedValue = this.convertFromINR(adjustedValuation, currency);
    
    return {
      value: convertedValue,
      details: { baseValuation, multiplier }
    };
  }
  
  // ========== SCORING METHODS ==========
  
  private scoreTeam(data: ValuationFormData): number {
    let score = 100; // Start at average
    
    // Boost for larger, more experienced team
    if (data.teamData?.size) {
      if (data.teamData.size > 10) score += 20;
      else if (data.teamData.size > 5) score += 10;
    }
    
    // Boost for revenue-generating (proves execution)
    if (data.financialData.revenue > 1000000) score += 30;
    else if (data.financialData.revenue > 100000) score += 15;
    
    return Math.min(150, Math.max(50, score));
  }
  
  private scoreOpportunity(data: ValuationFormData): number {
    let score = 100;
    
    // TAM/SAM assessment - data is already in INR from buildFullValuationData
    if (data.marketData?.tam) {
      const tamINR = data.marketData.tam; // Already in INR, no conversion needed
      if (tamINR > 500000000000) score += 30; // >₹5000 Cr
      else if (tamINR > 100000000000) score += 15; // >₹1000 Cr
    }
    
    // Growth rate
    if (data.marketData?.growthRate > 30) score += 20;
    else if (data.marketData?.growthRate > 15) score += 10;
    
    return Math.min(150, Math.max(50, score));
  }
  
  private scoreTechnology(data: ValuationFormData): number {
    let score = 100;
    
    if (data.productDetails?.maturity === "production") score += 30;
    else if (data.productDetails?.maturity === "prototype") score += 15;
    
    return Math.min(150, Math.max(50, score));
  }
  
  private scoreCompetition(data: ValuationFormData): number {
    let score = 100;
    
    const competitors = data.marketData?.competitors?.length || 0;
    if (competitors < 3) score += 20; // Low competition
    else if (competitors > 10) score -= 20; // High competition
    
    return Math.min(150, Math.max(50, score));
  }
  
  private scoreMarketing(data: ValuationFormData): number {
    let score = 100;
    
    // Strong marketing indicated by revenue and low CAC
    if (data.financialData.revenue > 0 && data.financialData.cac) {
      const cacToRevenue = data.financialData.cac / (data.financialData.revenue / 12);
      if (cacToRevenue < 0.3) score += 25; // Efficient marketing
    }
    
    return Math.min(150, Math.max(50, score));
  }
  
  private scoreFunding(data: ValuationFormData): number {
    let score = 100;
    
    // Good runway = less urgent need for funding
    if (data.financialData?.runway) {
      if (data.financialData.runway > 18) score -= 10; // Less urgent
      else if (data.financialData.runway < 6) score += 15; // More urgent
    }
    
    return Math.min(150, Math.max(50, score));
  }
  
  // ========== RISK ASSESSMENT METHODS ==========
  
  private assessManagementRisk(data: ValuationFormData): number {
    let risk = 0;
    
    // Strong team reduces risk
    if (data.teamData?.size && data.teamData.size > 5) risk += 1;
    if (data.financialData.revenue > 1000000) risk += 1; // Proven execution
    
    // Weak signals increase risk
    if (!data.teamData?.size || data.teamData.size < 3) risk -= 1;
    
    return Math.max(-2, Math.min(2, risk));
  }
  
  private assessStageRisk(data: ValuationFormData): number {
    const stage = data.productDetails?.maturity;
    if (stage === "production") return 1;
    if (stage === "prototype") return 0;
    return -1; // Concept stage
  }
  
  private assessLegislationRisk(data: ValuationFormData): number {
    // Industry-specific regulatory risk
    const industry = data.businessInfo.industry.toLowerCase();
    if (industry.includes("fintech") || industry.includes("health")) return -1;
    return 0;
  }
  
  private assessManufacturingRisk(data: ValuationFormData): number {
    const industry = data.businessInfo.industry.toLowerCase();
    if (industry.includes("saas") || industry.includes("software")) return 1; // Low risk
    if (industry.includes("manufacturing") || industry.includes("hardware")) return -1;
    return 0;
  }
  
  private assessSalesRisk(data: ValuationFormData): number {
    if (data.financialData.revenue > 5000000) return 1; // Proven sales
    if (data.financialData.revenue > 1000000) return 0.5;
    if (data.financialData.revenue > 0) return 0;
    return -1; // No revenue yet
  }
  
  private assessFundingRisk(data: ValuationFormData): number {
    if (data.financialData?.runway && data.financialData.runway > 18) return 1;
    if (data.financialData?.runway && data.financialData.runway < 6) return -1;
    return 0;
  }
  
  private assessCompetitionRisk(data: ValuationFormData): number {
    const competitors = data.marketData?.competitors?.length || 0;
    if (competitors < 3) return 1; // Low competition = positive
    if (competitors > 10) return -1; // High competition = negative
    return 0;
  }
  
  // ========== HELPER METHODS ==========
  
  private getExitMultiple(data: ValuationFormData): number {
    const industry = data.businessInfo.industry.toLowerCase();
    const margins = data.financialData.ltv && data.financialData.cac ? 
      (data.financialData.ltv / data.financialData.cac) : 2;
    
    // Industry-specific multiples (conservative for India)
    if (industry.includes("saas")) return margins > 3 ? 8 : 5;
    if (industry.includes("fintech")) return 6;
    if (industry.includes("ecommerce") || industry.includes("d2c")) return 3;
    if (industry.includes("edtech")) return 5;
    
    return 4; // Default conservative multiple
  }
  
  private determineMethodWeights(data: ValuationFormData, isPreRevenue: boolean) {
    if (isPreRevenue) {
      return {
        scorecard: 0.4,
        riskFactor: 0.4,
        vc: 0.2 // Less weight for pre-revenue VC method
      };
    }
    
    // Post-revenue: VC method more reliable
    return {
      scorecard: 0.3,
      riskFactor: 0.3,
      vc: 0.4
    };
  }
  
  private calculateConfidence(score: number, risk: number, vc: number, data: ValuationFormData): number {
    // Method agreement
    const values = [score, risk, vc];
    const avg = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const agreementScore = 1 - (Math.sqrt(variance) / avg);
    
    // Data completeness
    let completeness = 0.5; // Base score
    if (data.financialData.revenue > 0) completeness += 0.1;
    if (data.financialData.cac && data.financialData.ltv) completeness += 0.1;
    if (data.marketData.tam && data.marketData.sam) completeness += 0.1;
    if (data.teamData?.size) completeness += 0.1;
    if (data.financialData.runway) completeness += 0.1;
    
    const finalConfidence = (agreementScore * 0.6) + (completeness * 0.4);
    return Math.max(0.3, Math.min(0.9, finalConfidence));
  }
  
  private getValuationDrivers(data: ValuationFormData): string[] {
    const drivers: string[] = [];
    
    if (data.marketData?.growthRate && data.marketData.growthRate > 30) {
      drivers.push("High market growth rate");
    }
    if (data.financialData.revenue > 1000000) {
      drivers.push("Strong revenue base");
    }
    if (data.financialData.ltv && data.financialData.cac && data.financialData.ltv / data.financialData.cac > 3) {
      drivers.push("Excellent unit economics");
    }
    if (data.productDetails?.maturity === "production") {
      drivers.push("Production-ready product");
    }
    if (data.marketData?.tam && data.marketData.tam > 10000000000) {
      drivers.push("Large addressable market");
    }
    
    return drivers.length > 0 ? drivers : ["Early stage with growth potential"];
  }
  
  private getDisclaimers(): string[] {
    return [
      "This valuation is an estimate based on industry benchmarks and standard methodologies.",
      "Actual valuations may vary significantly based on market conditions, investor appetite, and company-specific factors.",
      "Not financial or investment advice. Consult with qualified professionals for specific guidance.",
      "AI-generated insights are estimates and should be verified with actual market data."
    ];
  }
  
  private convertToINR(value: number, fromCurrency: string): number {
    return value * (CURRENCY_TO_INR[fromCurrency] || 1);
  }
  
  private convertFromINR(valueINR: number, toCurrency: string): number {
    return valueINR / (CURRENCY_TO_INR[toCurrency] || 1);
  }
}
