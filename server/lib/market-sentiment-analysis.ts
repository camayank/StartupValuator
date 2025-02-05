import { openai } from '../services/ai-service';

export async function analyzeMarketSentiment(company: string, industry: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze market sentiment and trends for the specified company and industry.",
        },
        {
          role: "user",
          content: JSON.stringify({ company, industry }),
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Market sentiment analysis failed:", error);
    throw new Error("Failed to analyze market sentiment");
  }
}
