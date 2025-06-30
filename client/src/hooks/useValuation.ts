import { useState, useCallback } from 'react';

interface ValuationData {
  businessInfo?: {
    name: string;
    industry: string;
    stage: string;
    location: string;
  };
  financials?: {
    revenue: number;
    growth: number;
    expenses: number;
    teamSize: number;
  };
  market?: {
    marketSize: number;
    competitors: number;
    marketShare: number;
  };
}

interface ValuationResult {
  valuation: number;
  confidence: number;
  methodologies: Record<string, number>;
  analysis: {
    summary: string;
    recommendations: string[];
    risks: string[];
  };
}

export function useValuation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ValuationResult | null>(null);

  const calculateValuation = useCallback(async (data: ValuationData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call with professional demo data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: ValuationResult = {
        valuation: 2500000,
        confidence: 0.82,
        methodologies: {
          'DCF Analysis': 2800000,
          'Market Multiples': 2400000,
          'Revenue Multiple': 2300000,
        },
        analysis: {
          summary: "This early-stage startup shows strong potential with solid market positioning and experienced founding team. The valuation reflects current market conditions and growth trajectory.",
          recommendations: [
            "Focus on customer acquisition and retention metrics",
            "Strengthen intellectual property portfolio",
            "Expand strategic partnerships in target markets",
            "Build scalable operational infrastructure"
          ],
          risks: [
            "Market competition from established players",
            "Regulatory changes in target industry",
            "Key person dependency risk",
            "Technology adoption timeline uncertainty"
          ]
        }
      };
      
      setResult(mockResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate valuation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    calculateValuation,
    reset,
    isLoading,
    error,
    result
  };
}