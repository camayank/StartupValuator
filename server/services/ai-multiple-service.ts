import OpenAI from "openai";
import { industryBenchmarkService } from './industry-benchmark-service';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIMultipleService {
  private static instance: AIMultipleService;
  private cache: Map<string, { multiple: number; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  public static getInstance(): AIMultipleService {
    if (!AIMultipleService.instance) {
      AIMultipleService.instance = new AIMultipleService();
    }
    return AIMultipleService.instance;
  }

  async getIndustryMultiple(industry: string): Promise<number> {
    try {
      // First check local benchmark data
      const benchmarkData = industryBenchmarkService.getBenchmark(industry);
      if (benchmarkData?.ev_revenue) {
        return benchmarkData.ev_revenue;
      }

      // Check cache
      const cached = this.cache.get(industry);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.multiple;
      }

      // Use OpenAI to get the multiple
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst specialized in startup valuations. Provide only the numeric EV/Revenue multiple as a response."
          },
          {
            role: "user",
            content: `What is the current typical EV/Revenue multiple for ${industry} startups? Respond with only the number.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const multiple = this.parseMultiple(response.choices[0].message.content);
      
      // Cache the result
      this.cache.set(industry, {
        multiple,
        timestamp: Date.now()
      });

      return multiple;
    } catch (error) {
      console.error('Error fetching industry multiple:', error);
      return 8.0; // Default fallback multiple
    }
  }

  private parseMultiple(content: string): number {
    try {
      const parsed = JSON.parse(content);
      const multiple = parseFloat(parsed.multiple || parsed.value || content);
      if (isNaN(multiple) || multiple <= 0) {
        throw new Error('Invalid multiple value');
      }
      return multiple;
    } catch (error) {
      console.error('Error parsing multiple:', error);
      return 8.0; // Default fallback multiple
    }
  }
}

export const aiMultipleService = AIMultipleService.getInstance();
