import _ from 'lodash';
import type { BusinessInformation } from "../types/startup-business";

export class MarketAnalysisHandler {
  // Cache for market data
  private static marketDataCache: Record<string, any> = {};

  static async analyzeMarketContext(data: BusinessInformation) {
    const marketData = await this.getMarketData(data.industrySegment);
    
    return {
      marketSize: this.calculateMarketSize(marketData, data),
      competitiveLandscape: this.analyzeCompetition(marketData, data),
      growthMetrics: this.calculateGrowthMetrics(marketData, data),
      recommendations: this.generateRecommendations(marketData, data)
    };
  }

  private static async getMarketData(industry: string) {
    // Use cached data if available
    if (this.marketDataCache[industry]) {
      return this.marketDataCache[industry];
    }

    // In a real implementation, this would fetch from an API
    // For now, return mock data based on industry
    const mockData = {
      marketSize: this.getMockMarketSize(industry),
      growthRate: this.getMockGrowthRate(industry),
      competitorCount: this.getMockCompetitorCount(industry)
    };

    this.marketDataCache[industry] = mockData;
    return mockData;
  }

  private static getMockMarketSize(industry: string): number {
    const baseSizes: Record<string, number> = {
      "Medical Devices": 150000000000,
      "Digital Health": 200000000000,
      "Payment Processing": 180000000000,
      "Enterprise Software": 250000000000,
      "E-commerce": 300000000000
    };
    return baseSizes[industry] || 100000000000;
  }

  private static getMockGrowthRate(industry: string): number {
    const baseRates: Record<string, number> = {
      "Medical Devices": 8.5,
      "Digital Health": 15.2,
      "Payment Processing": 12.8,
      "Enterprise Software": 18.5,
      "E-commerce": 14.2
    };
    return baseRates[industry] || 10;
  }

  private static getMockCompetitorCount(industry: string): number {
    const baseCounts: Record<string, number> = {
      "Medical Devices": 250,
      "Digital Health": 500,
      "Payment Processing": 300,
      "Enterprise Software": 1000,
      "E-commerce": 2000
    };
    return baseCounts[industry] || 400;
  }

  private static calculateMarketSize(marketData: any, businessInfo: BusinessInformation) {
    return {
      total: marketData.marketSize,
      addressable: marketData.marketSize * 0.3, // Simplified TAM calculation
      serviceable: marketData.marketSize * 0.1, // Simplified SAM calculation
      obtainable: marketData.marketSize * 0.02  // Simplified SOM calculation
    };
  }

  private static analyzeCompetition(marketData: any, businessInfo: BusinessInformation) {
    return {
      totalCompetitors: marketData.competitorCount,
      marketConcentration: this.calculateMarketConcentration(marketData.competitorCount),
      competitiveAdvantage: this.assessCompetitiveAdvantage(businessInfo)
    };
  }

  private static calculateMarketConcentration(competitorCount: number): 'high' | 'medium' | 'low' {
    if (competitorCount < 100) return 'high';
    if (competitorCount < 500) return 'medium';
    return 'low';
  }

  private static assessCompetitiveAdvantage(businessInfo: BusinessInformation) {
    // Simplified assessment based on business model and description
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
      industryGrowthRate: marketData.growthRate,
      marketPotential: this.calculateMarketPotential(marketData.growthRate),
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
    
    // Business model factor
    if (['saas', 'platform', 'marketplace'].includes(businessInfo.businessModel)) {
      score += 3;
    }
    
    // Team size factor
    score += Math.min(businessInfo.teamSize / 2, 3);
    
    // Description comprehensiveness
    score += Math.min(businessInfo.description.length / 100, 4);
    
    return Math.min(score, 10);
  }

  private static generateRecommendations(marketData: any, businessInfo: BusinessInformation) {
    const recommendations = [];
    
    // Market size based recommendations
    if (marketData.marketSize > 200000000000) {
      recommendations.push('Consider focused market segmentation strategy');
    }
    
    // Competition based recommendations
    if (marketData.competitorCount > 1000) {
      recommendations.push('Focus on unique value proposition differentiation');
    }
    
    // Growth based recommendations
    if (marketData.growthRate > 15) {
      recommendations.push('Prepare scaling strategy to capture market growth');
    }
    
    // Team size recommendations
    const recommendedTeamSize = Math.ceil(marketData.marketSize / 50000000000);
    if (businessInfo.teamSize < recommendedTeamSize) {
      recommendations.push(`Consider expanding team size to ${recommendedTeamSize} for market opportunity`);
    }

    return recommendations;
  }
}

export default MarketAnalysisHandler;
