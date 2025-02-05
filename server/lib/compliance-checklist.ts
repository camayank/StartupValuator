import { z } from 'zod';
import { openai } from '../services/ai-service';

export async function generateComplianceChecklist(industry: string, region: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate a compliance checklist specific to the given industry and region, focusing on key regulatory requirements.",
        },
        {
          role: "user",
          content: JSON.stringify({ industry, region }),
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Compliance checklist generation failed:", error);
    throw new Error("Failed to generate compliance checklist");
  }
}
