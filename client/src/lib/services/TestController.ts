import type { BusinessInfo, FinancialData, MarketAnalysis } from "../types/shared";

export class TestController {
  static generateTestData(type: 'conservative' | 'optimistic' | 'base') {
    const baseData = {
      basicInfo: {
        name: "TechAI Solutions",
        sector: "technology",
        industry: "software_enterprise",
        stage: "ideation_validated",
        location: "Global",
        businessModel: "saas",
        teamSize: 5,
        founderExperience: 8
      },
      financials: {
        projectedRevenue: 1000000,
        burnRate: 50000,
        runwayMonths: 18,
        expenses: 300000,
        profits: 0,
        cashFlow: -50000
      },
      marketMetrics: {
        marketSize: {
          tam: 50000000000,
          sam: 5000000000,
          som: 500000000
        },
        marketGrowth: 25,
        marketResearchScore: 85,
        problemValidationScore: 90,
        solutionReadiness: 75,
        targetMarket: "Enterprise Software Companies",
        growthStrategy: "Product-led Growth"
      },
      competitive: {
        competitors: [
          {
            name: "OpenAI",
            strengths: ["Market leader", "Strong brand", "Advanced technology"],
            weaknesses: ["High cost", "Limited customization"],
            marketShare: 35
          },
          {
            name: "Anthropic",
            strengths: ["Advanced safety", "Research focus"],
            weaknesses: ["New entrant", "Limited enterprise features"],
            marketShare: 15
          }
        ],
        advantages: [
          "Enterprise specialization",
          "Data privacy focus",
          "Cost-effective model"
        ],
        barriers: [
          "Proprietary technology",
          "Industry partnerships",
          "Domain expertise"
        ]
      }
    };

    switch (type) {
      case 'conservative':
        return {
          ...baseData,
          financials: {
            ...baseData.financials,
            projectedRevenue: baseData.financials.projectedRevenue * 0.7,
            burnRate: baseData.financials.burnRate * 1.2
          },
          marketMetrics: {
            ...baseData.marketMetrics,
            marketGrowth: baseData.marketMetrics.marketGrowth * 0.8,
            solutionReadiness: baseData.marketMetrics.solutionReadiness * 0.9
          }
        };

      case 'optimistic':
        return {
          ...baseData,
          financials: {
            ...baseData.financials,
            projectedRevenue: baseData.financials.projectedRevenue * 1.3,
            burnRate: baseData.financials.burnRate * 0.9
          },
          marketMetrics: {
            ...baseData.marketMetrics,
            marketGrowth: baseData.marketMetrics.marketGrowth * 1.2,
            solutionReadiness: baseData.marketMetrics.solutionReadiness * 1.1
          }
        };

      default:
        return baseData;
    }
  }
}
