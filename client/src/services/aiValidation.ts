import OpenAI from "openai";
import { ValuationFormData } from "@/lib/validations";
import { 
  validateBusinessMetrics, 
  validateRegionCompliance,
  assessCashFlowStability,
  industryBenchmarks,
  regionRules,
  cashFlowStabilityRules
} from "@/lib/validation/businessRules";

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

  private getCacheKey(data: ValuationFormData): string {
    return JSON.stringify(data);
  }

  async validateInput(data: ValuationFormData): Promise<ValidationResponse> {
    const cacheKey = this.getCacheKey(data);
    const cached = this.validationCache.get(cacheKey);
    if (cached) return cached;

    try {
      // Apply business rules validation
      const businessMetricsWarnings = validateBusinessMetrics(data);
      const complianceChecks = validateRegionCompliance(data);
      const cashFlowStability = assessCashFlowStability(data);
      const stabilityRules = cashFlowStabilityRules[cashFlowStability];

      // Prepare context for AI validation
      const validationContext = {
        data,
        industryBenchmarks: industryBenchmarks[data.sector],
        regionRules: regionRules[data.region],
        cashFlowStability,
        stabilityRules,
        complianceChecks
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a financial validation expert that helps prevent errors in startup valuations.
            Analyze the input data and validation context to provide warnings and suggestions.
            Focus on:
            1. Data consistency and completeness
            2. Industry-specific requirements
            3. Regional compliance considerations
            4. Cash flow stability implications
            5. Potential risks and mitigation strategies

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
            content: JSON.stringify(validationContext)
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from AI service');
      }

      const result = JSON.parse(content) as ValidationResponse;

      // Combine AI warnings with business rules warnings
      result.warnings = [...businessMetricsWarnings, ...result.warnings];

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
        warnings: validateBusinessMetrics(data),
        suggestions: [],
        industryInsights: []
      };
    }
  }

  async predictPotentialIssues(data: ValuationFormData): Promise<string[]> {
    try {
      const validationContext = {
        data,
        industryBenchmarks: industryBenchmarks[data.sector],
        regionRules: regionRules[data.region],
        cashFlowStability: assessCashFlowStability(data)
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze the valuation inputs and predict potential issues that might arise.
            Consider:
            1. Industry-specific risks and challenges
            2. Regional market conditions and regulations
            3. Cash flow stability implications
            4. Growth sustainability factors
            5. Competitive landscape impacts

            Provide predictions in a JSON array of strings.`
          },
          {
            role: "user",
            content: JSON.stringify(validationContext)
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

  async getSuggestions(data: ValuationFormData): Promise<string[]> {
    try {
      const validationContext = {
        data,
        industryBenchmarks: industryBenchmarks[data.sector],
        regionRules: regionRules[data.region],
        cashFlowStability: assessCashFlowStability(data),
        stabilityRules: cashFlowStabilityRules[assessCashFlowStability(data)]
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Based on the valuation inputs and context, provide actionable suggestions to improve accuracy.
            Consider:
            1. Industry best practices and benchmarks
            2. Regional compliance requirements
            3. Cash flow stability improvements
            4. Risk mitigation strategies
            5. Growth optimization opportunities

            Provide suggestions in a JSON array of strings.`
          },
          {
            role: "user",
            content: JSON.stringify(validationContext)
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