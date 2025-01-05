import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PitchDeckAnalysis {
  overallScore: number;
  sections: {
    name: string;
    score: number;
    feedback: string;
    suggestions: string[];
  }[];
  keyStrengths: string[];
  improvementAreas: string[];
  marketAnalysis: string;
  competitiveAdvantage: string;
  presentationStyle: string;
}

export async function analyzePitchDeck(slides: {
  slideNumber: number;
  content: string;
  type: string;
}[]): Promise<PitchDeckAnalysis> {
  const prompt = `As a startup pitch deck expert, analyze the following pitch deck slides and provide comprehensive feedback:

Pitch Deck Content:
${slides.map(slide => `Slide ${slide.slideNumber} (${slide.type}):
${slide.content}`).join('\n\n')}

Provide a detailed analysis including:
1. Overall score (0-100)
2. Section-by-section analysis with scores and specific feedback
3. Key strengths
4. Areas for improvement
5. Market analysis insights
6. Competitive advantage assessment
7. Presentation style evaluation

Format the response as JSON with the following structure:
{
  "overallScore": number,
  "sections": [
    {
      "name": string,
      "score": number,
      "feedback": string,
      "suggestions": string[]
    }
  ],
  "keyStrengths": string[],
  "improvementAreas": string[],
  "marketAnalysis": string,
  "competitiveAdvantage": string,
  "presentationStyle": string
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert pitch deck analyst specializing in startup presentations. You provide detailed, actionable feedback to help founders improve their pitch decks.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result as PitchDeckAnalysis;
  } catch (error) {
    console.error("Error analyzing pitch deck:", error);
    throw new Error("Failed to analyze pitch deck");
  }
}
