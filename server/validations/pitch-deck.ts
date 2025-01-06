import { z } from "zod";

export const pitchDeckFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  problem: z.string().min(1, "Problem description is required"),
  solution: z.string().min(1, "Solution description is required"),
  marketSize: z.string().min(1, "Market size information is required"),
  businessModel: z.string().min(1, "Business model description is required"),
  competition: z.string().min(1, "Competition analysis is required"),
  traction: z.string().min(1, "Traction metrics are required"),
  team: z.string().min(1, "Team information is required"),
  financials: z.string().min(1, "Financial information is required"),
  fundingAsk: z.string().min(1, "Funding ask is required"),
  useOfFunds: z.string().min(1, "Use of funds description is required"),
  presentationStyle: z.enum(["professional", "modern", "creative", "minimal"]),
  colorScheme: z.enum(["blue", "green", "purple", "orange", "neutral"]),
  additionalNotes: z.string().optional(),
});

export type PitchDeckFormData = z.infer<typeof pitchDeckFormSchema>;
