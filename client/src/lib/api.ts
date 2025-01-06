import type { ValuationFormData } from "./validations";

export interface ValuationResponse {
  valuation: number;
  multiplier: number;
  details: {
    baseValuation: number;
    adjustments: Record<string, number>;
  };
  riskAssessment?: any;
  potentialPrediction?: any;
  ecosystemNetwork?: any;
}

// Sanitize numeric values before sending to API
const sanitizeNumericData = (data: ValuationFormData): ValuationFormData => {
  return {
    ...data,
    revenue: Number(data.revenue) || 0,
    growthRate: Number(data.growthRate) || 0,
    margins: Number(data.margins) || 0,
    valuation: Number(data.valuation) || 0,
    multiplier: Number(data.multiplier) || 0,
  };
};

export async function calculateValuation(data: ValuationFormData): Promise<ValuationResponse> {
  // Ensure all numeric fields are properly formatted
  const sanitizedData = sanitizeNumericData(data);

  const response = await fetch("/api/valuation", {
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
      throw new Error("Rate limit exceeded. Please try again in a few moments.");
    }

    const errorText = await response.text();
    throw new Error(`Failed to calculate valuation: ${errorText}`);
  }

  const result = await response.json();

  // Ensure all numeric fields are valid numbers
  return {
    valuation: Number(result.valuation) || 0,
    multiplier: Number(result.multiplier) || 0,
    details: {
      baseValuation: Number(result.details.baseValuation) || 0,
      adjustments: Object.fromEntries(
        Object.entries(result.details.adjustments || {}).map(([key, value]) => [
          key,
          Number(value) || 0,
        ])
      ),
    },
    riskAssessment: result.riskAssessment,
    potentialPrediction: result.potentialPrediction,
    ecosystemNetwork: result.ecosystemNetwork,
  };
}

export async function generateReport(data: ValuationFormData): Promise<Blob> {
  const sanitizedData = sanitizeNumericData(data);

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedData),
      });

      if (response.status === 429) {
        // Rate limit hit - wait longer before retry
        const retryAfter = parseInt(response.headers.get("Retry-After") || "5", 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        attempt++;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("Generated report is empty");
      }

      return blob;
    } catch (error) {
      console.error('Report generation error:', error);

      if (attempt === MAX_RETRIES - 1) {
        throw error;
      }
      // Wait before retrying, with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      attempt++;
    }
  }

  throw new Error("Maximum retry attempts reached");
}