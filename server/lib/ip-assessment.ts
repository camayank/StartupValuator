import { openai } from '../services/ai-service';

export async function assessIntellectualProperty(ip: any, industry: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the intellectual property portfolio and provide assessment of its strength and value.",
        },
        {
          role: "user",
          content: JSON.stringify({ ip, industry }),
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("IP assessment failed:", error);
    throw new Error("Failed to assess IP");
  }
}
