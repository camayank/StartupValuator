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

// Validate numeric values
const validateNumericData = (data: ValuationFormData): string[] => {
  const errors: string[] = [];

  if (data.revenue === undefined || isNaN(Number(data.revenue))) {
    errors.push("Revenue is required and must be a valid number");
  }
  if (data.growthRate === undefined || isNaN(Number(data.growthRate))) {
    errors.push("Growth rate is required and must be a valid number");
  }
  if (data.margins === undefined || isNaN(Number(data.margins))) {
    errors.push("Margins are required and must be a valid number");
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
    valuation: data.valuation !== undefined ? Number(data.valuation) : 0,
    multiplier: data.multiplier !== undefined ? Number(data.multiplier) : 0,
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
  } catch (error: any) {
    console.error('Valuation calculation error:', error);
    throw new Error(error.message || 'Failed to calculate valuation');
  }
}

export async function generateReport(data: ValuationFormData): Promise<Blob> {
  try {
    // Validate the input data
    const validationErrors = validateNumericData(data);
    if (validationErrors.length > 0) {
      throw new Error(`Cannot generate report: ${validationErrors.join(", ")}`);
    }

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

        // Validate the blob content type
        if (!blob.type.includes('pdf') && !blob.type.includes('json') && !blob.type.includes('xlsx')) {
          throw new Error("Invalid report format received");
        }

        return blob;
      } catch (error: any) {
        console.error('Report generation error:', error);

        if (attempt === MAX_RETRIES - 1) {
          throw new Error(`Failed to generate report: ${error.message}`);
        }
        // Wait before retrying, with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        attempt++;
      }
    }

    throw new Error("Maximum retry attempts reached");
  } catch (error: any) {
    console.error('Report generation error:', error);
    throw new Error(error.message || 'Failed to generate report');
  }
}