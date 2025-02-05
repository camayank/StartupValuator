import { openai } from '../services/ai-service';

export async function validateRevenueModel(data: {
  model: string;
  pricing: any;
  customerSegments: string[];
  revenueStreams: string[];
  industry: string;
  stage: string;
}) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze and validate the revenue model considering industry standards, pricing strategy, and customer segments.",
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
    console.error("Revenue model validation failed:", error);
    throw new Error("Failed to validate revenue model");
  }
}
