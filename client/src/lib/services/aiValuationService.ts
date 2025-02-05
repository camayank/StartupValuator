import type { ValuationFormData } from "../validations";

export interface AIValuationResponse {
  valuation: {
    base: number;
    low: number;
    high: number;
    confidence: number;
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: string[];
  methodology: {
    weights: {
      revenue: number;
      market: number;
      team: number;
      technology: number;
      traction: number;
    };
    adjustments: Record<string, number>;
  };
}

export async function generateAIValuation(data: ValuationFormData): Promise<AIValuationResponse> {
  try {
    const response = await fetch('/api/valuations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate valuation');
    }

    const result = await response.json();
    return result.valuation;
  } catch (error) {
    console.error("AI Valuation error:", error);
    throw new Error("Failed to generate AI valuation");
  }
}