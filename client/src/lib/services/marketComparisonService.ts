import type { ValuationFormData } from "@/lib/validations";

export interface MarketComparison {
  competitors: Array<{
    name: string;
    valuation: number;
    metrics: {
      revenue?: number;
      growth?: number;
      margins?: number;
      marketShare?: number;
    };
  }>;
  benchmarks: {
    averageValuation: number;
    medianValuation: number;
    valuationRange: {
      min: number;
      max: number;
    };
    metrics: {
      averageRevenue: number;
      averageGrowth: number;
      averageMargins: number;
    };
  };
  analysis: {
    relativePerfomance: {
      revenue?: 'above' | 'below' | 'average';
      growth?: 'above' | 'below' | 'average';
      margins?: 'above' | 'below' | 'average';
    };
    recommendedMultiples: {
      revenue: number;
      ebitda?: number;
      users?: number;
    };
    marketPosition: {
      segment: string;
      competitiveAdvantages: string[];
      challenges: string[];
    };
  };
}

export function analyzeMarketComparables(
  data: ValuationFormData,
  sector: string
): MarketComparison {
  // This is a simplified version. In a real implementation,
  // this would fetch data from a market database or external API
  const sectorMultiples = getSectorMultiples(sector);
  const competitors = getCompetitorData(sector, data.businessInfo?.industry);
  
  const averageValuation = competitors.reduce((sum, comp) => sum + comp.valuation, 0) / competitors.length;
  const valuations = competitors.map(c => c.valuation).sort((a, b) => a - b);
  const medianValuation = valuations[Math.floor(valuations.length / 2)];

  return {
    competitors,
    benchmarks: {
      averageValuation,
      medianValuation,
      valuationRange: {
        min: Math.min(...valuations),
        max: Math.max(...valuations),
      },
      metrics: calculateAverageMetrics(competitors),
    },
    analysis: generateMarketAnalysis(data, competitors, sectorMultiples),
  };
}

function getSectorMultiples(sector: string): Record<string, number> {
  // In a real implementation, these would come from a database or market data API
  const baseMultiples: Record<string, Record<string, number>> = {
    technology: { revenue: 10, ebitda: 15 },
    healthtech: { revenue: 12, ebitda: 18 },
    fintech: { revenue: 15, ebitda: 20 },
    enterprise: { revenue: 8, ebitda: 12 },
    consumer_digital: { revenue: 6, ebitda: 10 },
  };

  return baseMultiples[sector] || { revenue: 8, ebitda: 12 }; // Default multiples
}

function getCompetitorData(
  sector: string,
  industry?: string
): MarketComparison['competitors'] {
  // This would typically fetch real competitor data from a database or external API
  // For now, returning sample data based on sector
  return [
    {
      name: "Competitor A",
      valuation: 10000000,
      metrics: {
        revenue: 1000000,
        growth: 50,
        margins: 60,
        marketShare: 15,
      },
    },
    {
      name: "Competitor B",
      valuation: 15000000,
      metrics: {
        revenue: 1500000,
        growth: 40,
        margins: 55,
        marketShare: 20,
      },
    },
    {
      name: "Competitor C",
      valuation: 8000000,
      metrics: {
        revenue: 800000,
        growth: 60,
        margins: 65,
        marketShare: 10,
      },
    },
  ];
}

function calculateAverageMetrics(
  competitors: MarketComparison['competitors']
): MarketComparison['benchmarks']['metrics'] {
  const metrics = competitors.reduce(
    (acc, comp) => ({
      revenue: (acc.revenue || 0) + (comp.metrics.revenue || 0),
      growth: (acc.growth || 0) + (comp.metrics.growth || 0),
      margins: (acc.margins || 0) + (comp.metrics.margins || 0),
    }),
    { revenue: 0, growth: 0, margins: 0 }
  );

  return {
    averageRevenue: metrics.revenue / competitors.length,
    averageGrowth: metrics.growth / competitors.length,
    averageMargins: metrics.margins / competitors.length,
  };
}

function generateMarketAnalysis(
  data: ValuationFormData,
  competitors: MarketComparison['competitors'],
  sectorMultiples: Record<string, number>
): MarketComparison['analysis'] {
  const benchmarks = calculateAverageMetrics(competitors);
  
  const revenue = data.financialData?.revenue || 0;
  const growth = data.marketData?.growthRate || 0;
  
  return {
    relativePerfomance: {
      revenue: revenue > benchmarks.averageRevenue ? 'above' : 
               revenue === benchmarks.averageRevenue ? 'average' : 'below',
      growth: growth > benchmarks.averageGrowth ? 'above' : 
              growth === benchmarks.averageGrowth ? 'average' : 'below',
    },
    recommendedMultiples: {
      revenue: sectorMultiples.revenue,
      ebitda: sectorMultiples.ebitda,
    },
    marketPosition: {
      segment: determineMarketSegment(data),
      competitiveAdvantages: identifyCompetitiveAdvantages(data),
      challenges: identifyMarketChallenges(data),
    },
  };
}

function determineMarketSegment(data: ValuationFormData): string {
  // Logic to determine market segment based on business data
  return data.businessInfo?.sector || 'general';
}

function identifyCompetitiveAdvantages(data: ValuationFormData): string[] {
  const advantages: string[] = [];
  
  if (data.productDetails?.differentiators) {
    advantages.push('Unique Product Differentiation');
  }
  
  if (data.marketData?.growthRate && data.marketData.growthRate > 50) {
    advantages.push('High Growth Rate');
  }
  
  return advantages;
}

function identifyMarketChallenges(data: ValuationFormData): string[] {
  const challenges: string[] = [];
  
  if (data.marketData?.competitors?.length > 5) {
    challenges.push('Highly Competitive Market');
  }
  
  if (data.financialData?.runway && data.financialData.runway < 12) {
    challenges.push('Limited Runway');
  }
  
  return challenges;
}
