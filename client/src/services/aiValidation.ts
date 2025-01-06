import OpenAI from "openai";
import { ValuationFormData } from "@/lib/validations";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ValidationWarning {
  field: keyof ValuationFormData;
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string | number;
}

interface ValidationResponse {
  warnings: ValidationWarning[];
  suggestions: string[];
  industryInsights?: string[];
}

export class AIValidationService {
  private static instance: AIValidationService;
  private validationCache: Map<string, ValidationResponse>;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.validationCache = new Map();
  }

  public static getInstance(): AIValidationService {
    if (!AIValidationService.instance) {
      AIValidationService.instance = new AIValidationService();
    }
    return AIValidationService.instance;
  }

  private getCacheKey(data: Partial<ValuationFormData>): string {
    return JSON.stringify(data);
  }

  async validateInput(data: Partial<ValuationFormData>): Promise<ValidationResponse> {
    const cacheKey = this.getCacheKey(data);
    const cached = this.validationCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a financial validation expert that helps prevent errors in startup valuations.
            Analyze the input data and provide warnings and suggestions based on industry standards.
            Focus on detecting potential errors, inconsistencies, and unusual patterns.
            Provide specific, actionable feedback that helps users correct their inputs.
            Response must be in JSON format with the following structure:
            {
              "warnings": [
                {
                  "field": "string (one of: revenue, growthRate, margins, sector, stage)",
                  "message": "string",
                  "severity": "low|medium|high",
                  "suggestion": "number|string (optional)"
                }
              ],
              "suggestions": ["string"],
              "industryInsights": ["string"]
            }`
          },
          {
            role: "user",
            content: JSON.stringify(data)
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from AI service');
      }

      const result = JSON.parse(content) as ValidationResponse;
      this.validationCache.set(cacheKey, result);

      // Clear cache after timeout
      setTimeout(() => {
        this.validationCache.delete(cacheKey);
      }, this.cacheTimeout);

      return result;
    } catch (error) {
      console.error('AI Validation error:', error);
      // Fallback to basic validation
      return {
        warnings: [],
        suggestions: [],
        industryInsights: []
      };
    }
  }

  // Predict potential issues based on historical patterns
  async predictPotentialIssues(data: Partial<ValuationFormData>): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze the valuation inputs and predict potential issues that might arise.
            Consider both immediate and long-term implications.
            Focus on:
            1. Data consistency and completeness
            2. Industry-specific requirements
            3. Common pitfalls in similar valuations
            4. Regulatory compliance concerns
            Provide predictions in a JSON array of strings.`
          },
          {
            role: "user",
            content: JSON.stringify(data)
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from AI service');
      }

      const result = JSON.parse(content);
      return result.predictions || [];
    } catch (error) {
      console.error('AI Prediction error:', error);
      return [];
    }
  }

  // Get smart suggestions for improving valuation accuracy
  async getSuggestions(data: Partial<ValuationFormData>): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Based on the valuation inputs, provide actionable suggestions to improve accuracy.
            Consider:
            1. Industry best practices
            2. Similar successful valuations
            3. Current market conditions
            4. Growth stage considerations
            Provide suggestions in a JSON array of strings.`
          },
          {
            role: "user",
            content: JSON.stringify(data)
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from AI service');
      }

      const result = JSON.parse(content);
      return result.suggestions || [];
    } catch (error) {
      console.error('AI Suggestions error:', error);
      return [];
    }
  }
}

export const aiValidationService = AIValidationService.getInstance();