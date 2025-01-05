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

export async function calculateValuation(data: ValuationFormData): Promise<ValuationResponse> {
  const response = await fetch("/api/valuation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to calculate valuation: ${errorText}`);
  }

  return response.json();
}

export async function generateReport(data: ValuationFormData & ValuationResponse): Promise<Blob> {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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

      return response.blob();
    } catch (error) {
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