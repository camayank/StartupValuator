import { z } from 'zod';
import { openai } from '../services/ai-service';

export async function generateComplianceReport(data: any) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate a compliance report for the given business data, focusing on regulatory requirements, risks, and recommendations.",
        },
        {
          role: "user",
          content: JSON.stringify(data),
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Compliance report generation failed:", error);
    throw new Error("Failed to generate compliance report");
  }
}
