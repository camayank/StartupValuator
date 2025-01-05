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
    throw new Error("Failed to calculate valuation");
  }

  return response.json();
}

export async function generateReport(data: ValuationFormData & ValuationResponse): Promise<Blob> {
  const response = await fetch("/api/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to generate report");
  }

  return response.blob();
}