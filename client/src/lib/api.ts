import type { ValuationFormData } from "./validations";

export interface ValuationResponse {
  id: number;
  valuation: {
    valuation: number;
    multiplier: number;
    methodology: {
      dcfWeight: number;
      comparablesWeight: number;
      riskAdjustedWeight: number;
      aiAdjustedWeight: number;
      marketSentimentAdjustment: number;
    };
    confidenceScore: number;
    details: {
      baseValuation: number;
      methods: {
        dcf: { value: number; stages: any[] };
        comparables: { value: number; multiples: any };
        riskAdjusted: { value: number; factors: Record<string, number> };
        aiAdjusted: { value: number; factors: Record<string, number> };
      };
      scenarios: {
        worst: { value: number; probability: number };
        base: { value: number; probability: number };
        best: { value: number; probability: number };
        expectedValue: number;
      };
      sensitivityAnalysis: any;
      industryMetrics: any;
    };
    assumptions: any;
    marketAnalysis: {
      sentiment: any;
      trends: any;
      growthPotential: any;
    };
    aiInsights: {
      industryTrends: string[];
      riskFactors: string[];
      growthOpportunities: string[];
      recommendations: string[];
    };
  };
  message: string;
}

// Validate numeric values
const validateNumericData = (data: ValuationFormData): string[] => {
  const errors: string[] = [];

  if (!data.businessName?.trim()) {
    errors.push("Business name is required");
  }

  if (data.revenue !== undefined && (isNaN(Number(data.revenue)) || Number(data.revenue) < 0)) {
    errors.push("Revenue must be a valid non-negative number");
  }

  if (data.growthRate !== undefined && (isNaN(Number(data.growthRate)) || Number(data.growthRate) < -100)) {
    errors.push("Growth rate must be a valid number greater than -100%");
  }

  if (data.margins !== undefined && (isNaN(Number(data.margins)) || Number(data.margins) < -100)) {
    errors.push("Margins must be a valid number greater than -100%");
  }

  if (!data.sector) {
    errors.push("Sector is required");
  }

  if (!data.stage) {
    errors.push("Business stage is required");
  }

  return errors;
};

// Sanitize numeric values before sending to API
const sanitizeNumericData = (data: ValuationFormData): ValuationFormData => {
  return {
    ...data,
    revenue: data.revenue !== undefined ? Number(data.revenue) : 0,
    growthRate: data.growthRate !== undefined ? Number(data.growthRate) : 0,
    margins: data.margins !== undefined ? Number(data.margins) : 0,
    teamSize: data.teamSize !== undefined ? Number(data.teamSize) : 0,
    teamExperience: data.teamExperience !== undefined ? Number(data.teamExperience) : 0,
  };
};

export async function calculateValuation(data: ValuationFormData): Promise<ValuationResponse> {
  try {
    // Validate the input data
    const validationErrors = validateNumericData(data);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid input: ${validationErrors.join(", ")}`);
    }

    // Ensure all numeric fields are properly formatted
    const sanitizedData = sanitizeNumericData(data);

    console.log('Sending valuation request for:', sanitizedData.businessName);

    const response = await fetch("/api/valuations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedData),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Invalid input: ${await response.text()}`);
      }

      if (response.status === 429) {
        const errorData = await response.json();
        throw new Error(`Rate limit exceeded. Please try again in ${errorData.retryAfter} seconds.`);
      }

      const errorText = await response.text();
      throw new Error(`Failed to calculate valuation: ${errorText}`);
    }

    const result = await response.json();
    console.log('Valuation calculation completed successfully');

    return result;
  } catch (error: any) {
    console.error('Valuation calculation error:', error);
    throw new Error(error.message || 'Failed to calculate valuation');
  }
}

export async function generateReport(valuationId: number): Promise<Blob> {
  try {
    console.log('Generating report for valuation:', valuationId);

    const response = await fetch(`/api/valuations/${valuationId}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        const errorData = await response.json();
        throw new Error(`Rate limit exceeded. Please try again in ${errorData.retryAfter} seconds.`);
      }

      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error("Generated report is empty");
    }

    // Validate the blob content type
    if (!blob.type.includes('pdf') && !blob.type.includes('json') && !blob.type.includes('xlsx')) {
      throw new Error("Invalid report format received");
    }

    console.log('Report generated successfully');
    return blob;
  } catch (error: any) {
    console.error('Report generation error:', error);
    throw new Error(error.message || 'Failed to generate report');
  }
}