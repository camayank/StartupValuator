import { z } from 'zod';
import { openai } from '../services/ai-service';

export const pitchDeckAnalysisRequestSchema = z.object({
  slides: z.array(z.object({
    title: z.string(),
    content: z.string(),
    type: z.enum(['problem', 'solution', 'market', 'business_model', 'team', 'financials', 'other'])
  }))
});

export interface PitchDeckAnalysis {
  overallScore: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  slideAnalysis: {
    slideNumber: number;
    title: string;
    score: number;
    feedback: string;
  }[];
}

export async function analyzePitchDeck(
  slides: z.infer<typeof pitchDeckAnalysisRequestSchema>['slides']
): Promise<PitchDeckAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert pitch deck analyzer. Analyze the provided pitch deck slides and provide detailed feedback focusing on clarity, impact, and completeness.",
        },
        {
          role: "user",
          content: JSON.stringify(slides),
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    return analysis;
  } catch (error) {
    console.error("Pitch deck analysis error:", error);
    throw new Error("Failed to analyze pitch deck");
  }
}
