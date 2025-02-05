import { openai } from '../services/ai-service';

export async function evaluateTeamExpertise(team: any, industry: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Evaluate the team's expertise, experience, and capabilities relative to industry requirements.",
        },
        {
          role: "user",
          content: JSON.stringify({ team, industry }),
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Team evaluation failed:", error);
    throw new Error("Failed to evaluate team");
  }
}
