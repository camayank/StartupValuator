import { openai } from '../services/ai-service';

export async function assessBusinessModel(data: any, industry: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the business model and provide detailed assessment considering industry standards and best practices.",
        },
        {
          role: "user",
          content: JSON.stringify({ ...data, industry }),
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Business model assessment failed:", error);
    throw new Error("Failed to assess business model");
  }
}
