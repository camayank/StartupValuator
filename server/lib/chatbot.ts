import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatResponse {
  message: string;
  context?: {
    valuation?: number;
    insights?: string[];
    recommendations?: string[];
  };
}

// System prompt to define the chatbot's role and capabilities
const SYSTEM_PROMPT = `You are an expert financial advisor specializing in startup valuations and business strategy. Your role is to:
1. Provide detailed explanations of valuation concepts and methodologies
2. Offer guidance on improving business metrics and valuations
3. Help interpret valuation results and financial ratios
4. Suggest strategic improvements based on the company's current state

Always maintain a professional yet approachable tone. Base your advice on established financial principles and current market conditions.`;

export async function generateChatResponse(
  message: string,
  context?: {
    businessName?: string;
    industry?: string;
    stage?: string;
    revenue?: number;
    valuation?: number;
  }
): Promise<ChatResponse> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  // Add context if available
  if (context) {
    const contextPrompt = `Current context:
    Business: ${context.businessName || 'Not specified'}
    Industry: ${context.industry || 'Not specified'}
    Stage: ${context.stage || 'Not specified'}
    Revenue: ${context.revenue ? `$${context.revenue.toLocaleString()}` : 'Not specified'}
    Current Valuation: ${context.valuation ? `$${context.valuation.toLocaleString()}` : 'Not calculated'}
    `;
    messages.push({ role: "system", content: contextPrompt });
  }

  // Add user message
  messages.push({ role: "user", content: message });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;

    // Extract structured insights if the response contains them
    const insights = extractInsights(response || "");

    return {
      message: response || "I apologize, but I couldn't generate a response. Please try again.",
      context: insights,
    };
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate response from AI model");
  }
}

// Helper function to extract structured insights from the response
function extractInsights(response: string): {
  insights: string[];
  recommendations: string[];
} {
  const insights: string[] = [];
  const recommendations: string[] = [];

  // Split response into paragraphs
  const paragraphs = response.split("\n\n");

  paragraphs.forEach(paragraph => {
    if (paragraph.toLowerCase().includes("recommend") || 
        paragraph.toLowerCase().includes("should") ||
        paragraph.toLowerCase().includes("consider")) {
      recommendations.push(paragraph.trim());
    } else if (paragraph.toLowerCase().includes("analysis") ||
               paragraph.toLowerCase().includes("indicates") ||
               paragraph.toLowerCase().includes("suggests")) {
      insights.push(paragraph.trim());
    }
  });

  return {
    insights,
    recommendations,
  };
}

export type { ChatMessage, ChatResponse };
