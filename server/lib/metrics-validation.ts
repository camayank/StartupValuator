import { openai } from '../services/ai-service';

export async function validateMetrics(metrics: any, industry: string, region: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Validate business metrics against industry benchmarks and regional standards.",
        },
        {
          role: "user",
          content: JSON.stringify({ metrics, industry, region }),
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Metrics validation failed:", error);
    throw new Error("Failed to validate metrics");
  }
}
