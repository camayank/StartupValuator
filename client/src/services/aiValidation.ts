import OpenAI from "openai";
import { ValuationFormData } from "@/lib/validations";
import { 
  validateBusinessMetrics, 
  validateRegionCompliance,
  assessCashFlowStability,
  validateTAM,
  validateDCFInputs,
  calculateRiskPremium,
  generatePitchDeckMetrics,
  industryBenchmarks,
  regionRules,
  cashFlowStabilityRules,
  riskFactors
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
  riskAnalysis?: {
    totalRiskPremium: number;
    riskBreakdown: Record<string, number>;
    mitigationStrategies: string[];
  };
  valuationMetrics?: {
    dcf?: {
      enterpriseValue: number;
      sensitivityRange: { min: number; max: number };
    };
    marketMultiples?: {
      evRevenue: number;
      evEbitda: number;
      peRatio: number;
    };
    realOptions?: {
      optionValue: number;
      keyAssumptions: Record<string, any>;
    };
  };
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
      // Apply comprehensive business rules validation
      const businessMetricsWarnings = validateBusinessMetrics(data);
      const tamWarnings = validateTAM(data);
      const dcfWarnings = validateDCFInputs(data);
      const complianceChecks = validateRegionCompliance(data);
      const cashFlowStability = assessCashFlowStability(data);
      const stabilityRules = cashFlowStabilityRules[cashFlowStability];
      const riskPremium = calculateRiskPremium(data);
      const pitchDeckMetrics = generatePitchDeckMetrics(data);

      // Prepare comprehensive context for AI validation
      const validationContext = {
        data,
        industryBenchmarks: industryBenchmarks[data.sector],
        regionRules: regionRules[data.region],
        cashFlowStability,
        stabilityRules,
        complianceChecks,
        riskAnalysis: riskPremium,
        pitchDeckMetrics,
        warnings: [...businessMetricsWarnings, ...tamWarnings, ...dcfWarnings]
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a financial validation expert specializing in startup valuations.
            Analyze the comprehensive validation context to provide detailed insights.
            Focus on:
            1. Data consistency and completeness
            2. Industry-specific requirements and benchmarks
            3. Regional compliance and regulatory considerations
            4. Cash flow stability and sustainability
            5. Risk factors and mitigation strategies
            6. Valuation methodology appropriateness
            7. Growth potential and market positioning

            Response must be in JSON format with the following structure:
            {
              "warnings": [
                {
                  "field": "string (one of: revenue, growthRate, margins, tam, etc.)",
                  "message": "string",
                  "severity": "low|medium|high",
                  "suggestion": "number|string (optional)"
                }
              ],
              "suggestions": ["string"],
              "industryInsights": ["string"],
              "riskAnalysis": {
                "totalRiskPremium": number,
                "riskBreakdown": {"riskCategory": number},
                "mitigationStrategies": ["string"]
              },
              "valuationMetrics": {
                "dcf": {"enterpriseValue": number, "sensitivityRange": {"min": number, "max": number}},
                "marketMultiples": {"evRevenue": number, "evEbitda": number, "peRatio": number},
                "realOptions": {"optionValue": number, "keyAssumptions": {}}
              }
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
      result.warnings = [...validationContext.warnings, ...result.warnings];

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
        cashFlowStability: assessCashFlowStability(data),
        riskAnalysis: calculateRiskPremium(data),
        pitchDeckMetrics: generatePitchDeckMetrics(data)
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze the valuation context and predict potential issues.
            Consider:
            1. Industry-specific risks and challenges
            2. Regional market conditions and regulations
            3. Cash flow stability and sustainability
            4. Growth trajectory and market positioning
            5. Competitive landscape dynamics
            6. Valuation methodology appropriateness
            7. DCF assumptions and sensitivity factors
            8. Market multiple comparisons
            9. Real options considerations

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
        stabilityRules: cashFlowStabilityRules[assessCashFlowStability(data)],
        riskAnalysis: calculateRiskPremium(data),
        pitchDeckMetrics: generatePitchDeckMetrics(data)
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Based on the comprehensive valuation context, provide actionable suggestions.
            Consider:
            1. Industry best practices and benchmarks
            2. Regional compliance requirements
            3. Cash flow optimization opportunities
            4. Risk mitigation strategies
            5. Growth optimization potential
            6. Valuation methodology refinements
            7. Pitch deck enhancement opportunities
            8. Competitive positioning improvements

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