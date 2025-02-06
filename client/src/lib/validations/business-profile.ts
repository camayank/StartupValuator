```typescript
import { z } from "zod";
import { BUSINESS_SECTORS } from "@/lib/constants/business-sectors";

// Get all possible sectors
const sectors = Object.keys(BUSINESS_SECTORS);

// Get all possible business models
const businessModels = [
  "subscription",
  "transactional",
  "marketplace",
  "advertising",
  "licensing",
  "freemium",
  "saas",
  "enterprise",
  "direct_sales",
  "hardware",
  "hybrid"
] as const;

// Get all possible product stages
const productStages = [
  "concept",
  "prototype",
  "mvp",
  "beta",
  "market_ready",
  "scaling",
  "mature",
  "next_gen"
] as const;

// Validation schema for the business profile section
export const businessProfileSchema = z.object({
  businessInfo: z.object({
    name: z.string()
      .min(2, "Business name must be at least 2 characters")
      .max(100, "Business name must be less than 100 characters"),
    sector: z.enum([...sectors] as [string, ...string[]]),
    segment: z.string().min(1, "Industry segment is required"),
    subSegment: z.string().min(1, "Sub-segment is required"),
    businessModel: z.enum([...businessModels]),
    productStage: z.enum([...productStages])
  })
});

export type BusinessProfileData = z.infer<typeof businessProfileSchema>;

// Helper function to validate business name
export function validateBusinessName(name: string): string | null {
  if (!name) return "Business name is required";
  if (name.length < 2) return "Business name must be at least 2 characters";
  if (name.length > 100) return "Business name must be less than 100 characters";
  return null;
}

// Helper function to get available segments for a sector
export function getAvailableSegments(sector: string): string[] {
  return Object.keys(BUSINESS_SECTORS[sector] || {});
}

// Helper function to get available sub-segments
export function getAvailableSubSegments(sector: string, segment: string): string[] {
  return BUSINESS_SECTORS[sector]?.[segment] || [];
}

// Export constants for type safety
export const BUSINESS_MODELS = businessModels;
export const PRODUCT_STAGES = productStages;
```
