import { AIService } from './AIService';
import { ValuationEngine } from './ValuationEngine';
import type { BusinessInfo, FinancialData, MarketAnalysis } from '../types/shared';

interface ValuationReport {
  executiveSummary: {
    companyOverview: {
      name: string;
      industry: string;
      stage: string;
      keyMetrics: Record<string, any>;
    };
    valuationRange: {
      low: number;
      high: number;
    };
    keyHighlights: string[];
  };
  detailedAnalysis: {
    market: {
      size: Record<string, number>;
      growth: number;
      opportunity: string[];
      risks: string[];
    };
    competition: {
      landscape: any[];
      positioning: string[];
      barriers: string[];
    };
    team: {
      composition: any;
      experience: number;
      analysis: string[];
    };
    technology: {
      readiness: number;
      innovation: string[];
      risks: string[];
    };
  };
  valuationDetails: {
    methodologies: {
      scorecard: number;
      riskAdjusted: number;
      vc: number;
    };
    rationale: string[];
    benchmarks: Record<string, any>;
  };
  recommendations: {
    strategic: string[];
    operational: string[];
  };
}

export class ReportGenerator {
  static async generateFullReport(data: any): Promise<ValuationReport> {
    // Get AI Insights
    const aiInsights = await AIService.generateValuationInsights(data);
    
    // Calculate Valuation
    const valuation = ValuationEngine.calculateValuation(data, aiInsights);

    return {
      executiveSummary: {
        companyOverview: this.generateOverview(data),
        valuationRange: valuation.range,
        keyHighlights: aiInsights.valuation.justification
      },
      detailedAnalysis: {
        market: this.analyzeMarket(data, aiInsights),
        competition: this.analyzeCompetition(data),
        team: this.analyzeTeam(data),
        technology: this.analyzeTechnology(data, aiInsights)
      },
      valuationDetails: {
        methodologies: valuation.methods,
        rationale: aiInsights.valuation.justification,
        benchmarks: aiInsights.benchmarks
      },
      recommendations: {
        strategic: aiInsights.recommendations,
        operational: this.generateOperationalRecommendations(data)
      }
    };
  }

  private static generateOverview(data: any) {
    return {
      name: data.basicInfo.name,
      industry: data.basicInfo.industry,
      stage: data.basicInfo.stage,
      keyMetrics: {
        teamSize: data.basicInfo.teamSize,
        projectedRevenue: data.financials.projectedRevenue,
        burnRate: data.financials.burnRate,
        runway: data.financials.runwayMonths
      }
    };
  }

  private static analyzeMarket(data: any, aiInsights: any) {
    return {
      size: data.marketMetrics.marketSize,
      growth: data.marketMetrics.marketGrowth,
      opportunity: aiInsights.growth.drivers,
      risks: aiInsights.growth.risks
    };
  }

  private static analyzeCompetition(data: any) {
    return {
      landscape: data.competitive.competitors,
      positioning: data.competitive.advantages,
      barriers: data.competitive.barriers
    };
  }

  private static analyzeTeam(data: any) {
    return {
      composition: {
        size: data.basicInfo.teamSize,
        experience: data.basicInfo.founderExperience
      },
      experience: data.basicInfo.founderExperience,
      analysis: [
        `Team of ${data.basicInfo.teamSize} with ${data.basicInfo.founderExperience} years of experience`,
        `Strong domain expertise in ${data.basicInfo.industry}`,
        `Proven track record in ${data.basicInfo.sector}`
      ]
    };
  }

  private static analyzeTechnology(data: any, aiInsights: any) {
    return {
      readiness: data.marketMetrics.solutionReadiness,
      innovation: [
        `${data.basicInfo.industry} focused solution`,
        `Proprietary technology stack`,
        `Scalable architecture`
      ],
      risks: aiInsights.growth.risks.filter((risk: string) => 
        risk.toLowerCase().includes('tech') || 
        risk.toLowerCase().includes('product')
      )
    };
  }

  private static generateOperationalRecommendations(data: any): string[] {
    const recommendations = [];

    // Team-based recommendations
    if (data.basicInfo.teamSize < 5) {
      recommendations.push('Consider strategic hiring in key positions');
    }

    // Financial recommendations
    if (data.financials.runwayMonths < 12) {
      recommendations.push('Prioritize fundraising to extend runway');
    }

    // Market-based recommendations
    if (data.marketMetrics.marketGrowth > 20) {
      recommendations.push('Accelerate market expansion plans');
    }

    return recommendations;
  }
}
