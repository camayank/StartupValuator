/**
 * Enhanced Valuation Calculator
 *
 * Implements comprehensive valuation framework with multiple methods:
 * 1. DCF (Discounted Cash Flow) - For revenue-generating startups
 * 2. Berkus Method - For pre-revenue startups (India-adapted)
 * 3. Scorecard Method - Comparative analysis
 * 4. Risk Factor Summation - Risk-adjusted valuation
 * 5. Hybrid Method - Weighted combination of all methods
 */

import { DCFValuationService } from './valuation/dcf.service';
import { BerkusValuationService } from './valuation/berkus.service';
import { ScorecardValuationService } from './valuation/scorecard.service';
import { RiskSummationService } from './valuation/risk-summation.service';
import { InvestmentReadinessService } from './investment-readiness.service';
import type { ValuationFormData } from "../../client/src/lib/validations";

// India-specific base valuations by stage (in INR)
const INDIA_BASE_VALUATIONS: Record<string, number> = {
  "Pre-seed / Idea Stage": 20000000, // ₹2 Cr
  "Seed Stage": 50000000, // ₹5 Cr
  "Series A": 150000000, // ₹15 Cr
  "Series B": 400000000, // ₹40 Cr
  "Series C+": 1000000000, // ₹100 Cr
  "Revenue-generating (No funding yet)": 30000000, // ₹3 Cr
  "concept": 15000000, // ₹1.5 Cr
  "prototype": 25000000, // ₹2.5 Cr
  "mvp": 40000000, // ₹4 Cr
  "beta": 60000000, // ₹6 Cr
  "market_ready": 100000000, // ₹10 Cr
  "scaling": 300000000, // ₹30 Cr
  "mature": 800000000 // ₹80 Cr
};

interface EnhancedValuationResult {
  valuation: number;
  valuationRange: {
    conservative: number;
    base: number;
    optimistic: number;
  };
  methodologies: {
    dcf?: any;
    berkus?: any;
    scorecard: any;
    riskSummation: any;
  };
  confidence: number;
  investmentReadiness?: any;
  insights: string[];
  warnings: string[];
  currency: string;
  metadata: {
    isPreRevenue: boolean;
    methodWeights: Record<string, number>;
    disclaimers: string[];
  };
}

export class EnhancedValuationCalculator {
  private dcfService = new DCFValuationService();
  private berkusService = new BerkusValuationService();
  private scorecardService = new ScorecardValuationService();
  private riskSummationService = new RiskSummationService();
  private readinessService = new InvestmentReadinessService();

  /**
   * Calculate comprehensive valuation using multiple methods
   */
  public calculateValuation(data: ValuationFormData, currency: string = "INR"): EnhancedValuationResult {
    const isPreRevenue = !data.financialData || data.financialData.revenue === 0;
    const insights: string[] = [];
    const warnings: string[] = [];

    // Determine which methods to use
    const methodWeights = this.determineMethodWeights(data, isPreRevenue);

    let valuations: { method: string; value: number; weight: number }[] = [];

    // 1. Apply Berkus Method for pre-revenue startups
    if (isPreRevenue) {
      const berkusInputs = this.prepareBerkusInputs(data);
      const berkusResult = this.berkusService.calculate(berkusInputs);

      valuations.push({
        method: 'berkus',
        value: berkusResult.equityValue,
        weight: methodWeights.berkus || 0
      });

      insights.push(...berkusResult.reasoning);
    }

    // 2. Apply DCF Method for revenue-generating startups
    let dcfResult = null;
    if (!isPreRevenue && data.financialData.revenue > 0) {
      try {
        const dcfInputs = this.prepareDCFInputs(data);
        dcfResult = this.dcfService.calculate(dcfInputs);

        valuations.push({
          method: 'dcf',
          value: dcfResult.equityValue,
          weight: methodWeights.dcf || 0
        });

        insights.push(`DCF valuation based on ${dcfInputs.projectionYears}-year cash flow projections`);
        insights.push(`Discount rate: ${dcfInputs.discountRate}%, Terminal growth: ${dcfInputs.terminalGrowthRate}%`);
      } catch (error) {
        warnings.push(`DCF calculation skipped: ${(error as Error).message}`);
      }
    }

    // 3. Scorecard Method
    const scorecardInputs = this.prepareScorecardInputs(data, isPreRevenue);
    const scorecardResult = this.scorecardService.calculate(scorecardInputs);

    valuations.push({
      method: 'scorecard',
      value: scorecardResult.equityValue,
      weight: methodWeights.scorecard || 0
    });

    insights.push(...scorecardResult.reasoning.slice(0, 3)); // Top 3 insights

    // 4. Risk Factor Summation
    const riskInputs = this.prepareRiskSummationInputs(data, scorecardResult.equityValue);
    const riskResult = this.riskSummationService.calculate(riskInputs);

    valuations.push({
      method: 'risk_summation',
      value: riskResult.equityValue,
      weight: methodWeights.riskSummation || 0
    });

    // Calculate weighted average valuation
    const weightedValuation = valuations.reduce((sum, v) => sum + (v.value * v.weight), 0);

    // Calculate confidence
    const confidence = this.calculateOverallConfidence(valuations, data);

    // Calculate valuation range
    const conservativeFactor = 0.65;
    const optimisticFactor = 1.5;

    // Add reality checks
    if (weightedValuation > 5000000000 && isPreRevenue) { // >₹50 Cr for pre-revenue
      warnings.push('Valuation seems unusually high for pre-revenue startup. Review assumptions.');
    }

    if (data.marketData && weightedValuation > data.marketData.tam * 0.3) {
      warnings.push('Valuation exceeds 30% of TAM - highly unusual. Verify market size estimates.');
    }

    return {
      valuation: Math.round(weightedValuation),
      valuationRange: {
        conservative: Math.round(weightedValuation * conservativeFactor),
        base: Math.round(weightedValuation),
        optimistic: Math.round(weightedValuation * optimisticFactor)
      },
      methodologies: {
        dcf: dcfResult,
        berkus: isPreRevenue ? this.berkusService.calculate(this.prepareBerkusInputs(data)) : undefined,
        scorecard: scorecardResult,
        riskSummation: riskResult
      },
      confidence,
      insights,
      warnings,
      currency,
      metadata: {
        isPreRevenue,
        methodWeights,
        disclaimers: this.getDisclaimers()
      }
    };
  }

  /**
   * Calculate investment readiness score
   */
  public calculateReadiness(data: ValuationFormData) {
    const readinessInputs = {
      revenue: data.financialData.revenue || 0,
      ebitda: 0, // Would come from expanded financial data
      monthlyBurnRate: data.financialData.burnRate || 0,
      cashInBank: 0, // Would come from balance sheet
      totalLiabilities: 0,
      shareholdersEquity: 0,
      tam: data.marketData.tam,
      sam: data.marketData.sam,
      marketGrowthRate: data.marketData.growthRate,
      competitors: data.marketData.competitors?.length || 0,
      foundersCount: 1,
      teamSize: data.teamData?.size || 1,
      hasTechnicalCofounder: true, // Would come from team data
      hasBusinessCofounder: true,
      customers: 0, // Would come from operational metrics
      cac: data.financialData.cac,
      ltv: data.financialData.ltv,
      hasDPIIT: false, // Would come from compliance data
      hasAuditedFinancials: false,
      hasCompleteCapTable: false,
      hasIPProtection: false,
      gstCompliant: true
    };

    return this.readinessService.assess(readinessInputs);
  }

  /**
   * Determine weights for each valuation method based on data availability and stage
   */
  private determineMethodWeights(data: ValuationFormData, isPreRevenue: boolean): Record<string, number> {
    if (isPreRevenue) {
      return {
        berkus: 0.40,
        scorecard: 0.35,
        riskSummation: 0.25,
        dcf: 0
      };
    } else {
      // Revenue-generating
      const hasStrongFinancials = data.financialData.revenue > 10000000; // >₹1 Cr

      if (hasStrongFinancials) {
        return {
          dcf: 0.50,
          scorecard: 0.25,
          riskSummation: 0.25,
          berkus: 0
        };
      } else {
        return {
          dcf: 0.30,
          scorecard: 0.40,
          riskSummation: 0.30,
          berkus: 0
        };
      }
    }
  }

  /**
   * Prepare inputs for Berkus method
   */
  private prepareBerkusInputs(data: ValuationFormData): any {
    const stage = data.businessInfo.productStage || 'concept';

    return {
      hasPrototype: ['prototype', 'mvp', 'beta', 'market_ready', 'scaling'].includes(stage),
      hasMinimalViableProduct: ['mvp', 'beta', 'market_ready', 'scaling'].includes(stage),
      hasBetaCustomers: ['beta', 'market_ready', 'scaling'].includes(stage),
      teamQuality: 7, // Default, would be calculated from team data
      strategicRelationships: 5,
      ideaSoundness: 7,
      marketSize: data.marketData.tam,
      intellectualProperty: false, // Would come from IP data
      stage
    };
  }

  /**
   * Prepare inputs for DCF method
   */
  private prepareDCFInputs(data: ValuationFormData): any {
    return {
      historicalRevenue: [], // Would come from historical financial data
      currentRevenue: data.financialData.revenue,
      currentEBITDA: data.financialData.revenue * 0.15, // Estimate 15% EBITDA margin
      projectionYears: data.valuationInputs?.timeHorizon || 5,
      discountRate: data.valuationInputs?.discountRate || 25,
      terminalGrowthRate: data.valuationInputs?.terminalGrowthRate || 3,
      revenueGrowthRate: data.marketData.growthRate
    };
  }

  /**
   * Prepare inputs for Scorecard method
   */
  private prepareScorecardInputs(data: ValuationFormData, isPreRevenue: boolean): any {
    const stage = data.businessInfo.productStage || 'seed';
    const baselineValuation = INDIA_BASE_VALUATIONS[stage] || INDIA_BASE_VALUATIONS["Seed Stage"];

    // Convert market data and team data to 0-10 ratings
    const teamRating = data.teamData?.size || 0 >= 10 ? 8 : 6;
    const marketRating = data.marketData.tam >= 100000000000 ? 9 : 7;
    const productRating = isPreRevenue ? 5 : 7;

    return {
      baselineValuation,
      industry: data.businessInfo.industry,
      stage,
      factors: {
        strengthOfTeam: teamRating,
        sizeOfOpportunity: marketRating,
        productTechnology: productRating,
        competitiveEnvironment: data.marketData.competitors?.length || 0 <= 5 ? 8 : 5,
        marketingChannels: 6, // Default
        needForFunding: data.financialData.burnRate > 0 ? 4 : 7,
        partnerships: 5 // Default
      }
    };
  }

  /**
   * Prepare inputs for Risk Summation method
   */
  private prepareRiskSummationInputs(data: ValuationFormData, baseValuation: number): any {
    const isEarlyStage = ['concept', 'prototype', 'mvp'].includes(data.businessInfo.productStage || '');

    return {
      baseValuation,
      riskFactors: {
        managementRisk: data.teamData?.size || 0 >= 5 ? 2 : 4, // 2 = low risk
        stageRisk: isEarlyStage ? 4 : 2,
        legislationRisk: 3, // Neutral
        manufacturingRisk: data.businessInfo.businessModel === 'marketplace' ? 2 : 3,
        salesMarketingRisk: 3,
        fundingRisk: data.financialData.runway || 0 >= 12 ? 2 : 4,
        competitionRisk: data.marketData.competitors?.length || 0 > 20 ? 4 : 3,
        technologyRisk: 3,
        litigationRisk: 2,
        reputationRisk: 2
      }
    };
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(
    valuations: { method: string; value: number; weight: number }[],
    data: ValuationFormData
  ): number {
    let confidence = 70; // Base confidence

    // Check variance between methods
    const values = valuations.map(v => v.value);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / avg) * 100;

    // Lower variance = higher confidence
    if (coefficientOfVariation < 20) {
      confidence += 15;
    } else if (coefficientOfVariation < 40) {
      confidence += 5;
    } else if (coefficientOfVariation > 60) {
      confidence -= 10;
    }

    // Increase confidence with more data
    if (data.financialData.revenue > 0) {
      confidence += 5;
    }
    if (data.marketData.tam > 0 && data.marketData.sam > 0) {
      confidence += 5;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  private getDisclaimers(): string[] {
    return [
      'This valuation is an estimate and should not be considered as financial advice',
      'Actual valuation may vary based on investor perspective, market conditions, and negotiation',
      'Multiple valuation methods are used to provide a comprehensive view',
      'Consult with financial advisors and valuers for formal valuation requirements',
      'Currency rates are approximate and may vary',
      'Startups are inherently risky; past performance does not guarantee future results'
    ];
  }
}
