import _ from 'lodash';
import type { BusinessInformation } from "../types/startup-business";

class MarketDataCollector {
  private marketDataCache: Record<string, any> = {};

  private async fetchMarketData(industry: string) {
    // Mock implementation of data collection
    // In production, this would connect to actual APIs
    return {
      marketSize: this.getMockMarketSize(industry),
      growthRate: this.getMockGrowthRate(industry),
      competitorCount: this.getMockCompetitorCount(industry),
      confidence: 0.85
    };
  }

  async collectAndNormalizeData(industry: string) {
    if (this.marketDataCache[industry]) {
      return this.marketDataCache[industry];
    }

    const data = await this.fetchMarketData(industry);
    const normalizedData = this.normalizeData(data);
    this.marketDataCache[industry] = normalizedData;
    return normalizedData;
  }

  private normalizeData(data: any) {
    return {
      marketSize: {
        total: data.marketSize,
        confidence: data.confidence
      },
      growth: {
        rate: data.growthRate,
        confidence: data.confidence
      },
      competition: {
        count: data.competitorCount,
        concentration: this.calculateMarketConcentration(data.competitorCount)
      }
    };
  }

  private getMockMarketSize(industry: string): number {
    const baseSizes: Record<string, number> = {
      "Medical Devices": 150000000000,
      "Digital Health": 200000000000,
      "Payment Processing": 180000000000,
      "Enterprise Software": 250000000000,
      "E-commerce": 300000000000
    };
    return baseSizes[industry] || 100000000000;
  }

  private getMockGrowthRate(industry: string): number {
    const baseRates: Record<string, number> = {
      "Medical Devices": 8.5,
      "Digital Health": 15.2,
      "Payment Processing": 12.8,
      "Enterprise Software": 18.5,
      "E-commerce": 14.2
    };
    return baseRates[industry] || 10;
  }

  private getMockCompetitorCount(industry: string): number {
    const baseCounts: Record<string, number> = {
      "Medical Devices": 250,
      "Digital Health": 500,
      "Payment Processing": 300,
      "Enterprise Software": 1000,
      "E-commerce": 2000
    };
    return baseCounts[industry] || 400;
  }

  private calculateMarketConcentration(competitorCount: number): 'high' | 'medium' | 'low' {
    if (competitorCount < 100) return 'high';
    if (competitorCount < 500) return 'medium';
    return 'low';
  }
}

export class MarketAnalysisHandler {
  private static marketDataCollector = new MarketDataCollector();

  static async analyzeMarketContext(data: BusinessInformation) {
    const marketData = await this.marketDataCollector.collectAndNormalizeData(data.industrySegment);

    return {
      marketSize: this.calculateMarketSize(marketData, data),
      competitiveLandscape: this.analyzeCompetition(marketData, data),
      growthMetrics: this.calculateGrowthMetrics(marketData, data),
      recommendations: this.generateRecommendations(marketData, data)
    };
  }

  private static calculateMarketSize(marketData: any, businessInfo: BusinessInformation) {
    return {
      total: marketData.marketSize.total,
      addressable: marketData.marketSize.total * 0.3, 
      serviceable: marketData.marketSize.total * 0.1, 
      obtainable: marketData.marketSize.total * 0.02  
    };
  }

  private static analyzeCompetition(marketData: any, businessInfo: BusinessInformation) {
    return {
      totalCompetitors: marketData.competition.count,
      marketConcentration: marketData.competition.concentration,
      competitiveAdvantage: this.assessCompetitiveAdvantage(businessInfo)
    };
  }

  private static assessCompetitiveAdvantage(businessInfo: BusinessInformation) {
    const advantages = [];

    if (businessInfo.businessModel === 'saas') {
      advantages.push('Scalable Software Model');
    }

    if (businessInfo.teamSize > 5) {
      advantages.push('Strong Team Capacity');
    }

    if (businessInfo.description.length > 200) {
      advantages.push('Well-Defined Value Proposition');
    }

    return advantages;
  }

  private static calculateGrowthMetrics(marketData: any, businessInfo: BusinessInformation) {
    return {
      industryGrowthRate: marketData.growth.rate,
      marketPotential: this.calculateMarketPotential(marketData.growth.rate),
      scalabilityScore: this.calculateScalabilityScore(businessInfo)
    };
  }

  private static calculateMarketPotential(growthRate: number): 'high' | 'medium' | 'low' {
    if (growthRate > 15) return 'high';
    if (growthRate > 8) return 'medium';
    return 'low';
  }

  private static calculateScalabilityScore(businessInfo: BusinessInformation): number {
    let score = 0;

    if (['saas', 'platform', 'marketplace'].includes(businessInfo.businessModel)) {
      score += 3;
    }

    score += Math.min(businessInfo.teamSize / 2, 3);

    score += Math.min(businessInfo.description.length / 100, 4);

    return Math.min(score, 10);
  }

  private static generateRecommendations(marketData: any, businessInfo: BusinessInformation) {
    const recommendations = [];

    if (marketData.marketSize.total > 200000000000) {
      recommendations.push('Consider focused market segmentation strategy');
    }

    if (marketData.competition.count > 1000) {
      recommendations.push('Focus on unique value proposition differentiation');
    }

    if (marketData.growth.rate > 15) {
      recommendations.push('Prepare scaling strategy to capture market growth');
    }

    const recommendedTeamSize = Math.ceil(marketData.marketSize.total / 50000000000);
    if (businessInfo.teamSize < recommendedTeamSize) {
      recommendations.push(`Consider expanding team size to ${recommendedTeamSize} for market opportunity`);
    }

    return recommendations;
  }
}

export default MarketAnalysisHandler;