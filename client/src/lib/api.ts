import type { ValuationFormData, ValuationData } from "./validations";

export async function calculateValuation(data: ValuationFormData): Promise<ValuationData> {
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
