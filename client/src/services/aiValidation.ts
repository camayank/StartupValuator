import OpenAI from "openai";
import { ValuationFormData } from "@/lib/validations";
import { 
  validateBusinessMetrics, 
  validateRegionCompliance,
  assessCashFlowStability,
  validateTAM,
  validateDCFInputs,
  validateFinancialProjections,
  validateCurrencyConsistency,
  validateValuationPurpose,
  validateAssetValuation,
  calculateRiskPremium,
  generatePitchDeckMetrics,
  industryBenchmarks,
  enhancedRegionRules,
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
  financialProjections?: {
    revenue: number[];
    ebitda: number[];
    fcf: number[];
    years: string[];
  };
  macroeconomicFactors?: {
    gdpImpact: number;
    inflationAdjustment: number;
    interestRateEffect: number;
  };
  currencyAnalysis?: {
    exchangeRateRisk: number;
    hedgingRecommendations: string[];
  };
  assetValuation?: {
    tangibleAssetsValue: number;
    intangibleAssetsValue: number;
    totalEnterpriseValue: number;
  };
  riskAnalysis?: {
    totalRiskPremium: number;
    riskBreakdown: Record<string, number>;
    mitigationStrategies: string[];
  };
  complianceChecks?: {
    status: 'compliant' | 'non_compliant';
    requirements: string[];
    missingElements: string[];
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
      const projectionsWarnings = validateFinancialProjections(data);
      const currencyWarnings = validateCurrencyConsistency(data);
      const purposeWarnings = validateValuationPurpose(data);
      const assetWarnings = validateAssetValuation(data);
      const complianceChecks = validateRegionCompliance(data);
      const cashFlowStability = assessCashFlowStability(data);
      const stabilityRules = cashFlowStabilityRules[cashFlowStability];
      const riskPremium = calculateRiskPremium(data);
      const pitchDeckMetrics = generatePitchDeckMetrics(data);

      // Prepare comprehensive context for AI validation
      const validationContext = {
        data,
        industryBenchmarks: industryBenchmarks[data.sector],
        regionRules: enhancedRegionRules[data.region],
        cashFlowStability,
        stabilityRules,
        complianceChecks,
        riskAnalysis: riskPremium,
        pitchDeckMetrics,
        warnings: [
          ...businessMetricsWarnings,
          ...tamWarnings,
          ...dcfWarnings,
          ...projectionsWarnings,
          ...currencyWarnings,
          ...purposeWarnings,
          ...assetWarnings
        ]
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
            4. Financial projections accuracy
            5. Currency and macroeconomic impacts
            6. Asset valuation appropriateness
            7. Risk factors and mitigation strategies
            8. Growth potential and market positioning

            Response must be in JSON format with the following structure:
            {
              "warnings": [],
              "suggestions": [],
              "industryInsights": [],
              "financialProjections": {
                "revenue": [],
                "ebitda": [],
                "fcf": [],
                "years": []
              },
              "macroeconomicFactors": {
                "gdpImpact": number,
                "inflationAdjustment": number,
                "interestRateEffect": number
              },
              "currencyAnalysis": {
                "exchangeRateRisk": number,
                "hedgingRecommendations": []
              },
              "assetValuation": {
                "tangibleAssetsValue": number,
                "intangibleAssetsValue": number,
                "totalEnterpriseValue": number
              },
              "riskAnalysis": {
                "totalRiskPremium": number,
                "riskBreakdown": {},
                "mitigationStrategies": []
              },
              "complianceChecks": {
                "status": "compliant|non_compliant",
                "requirements": [],
                "missingElements": []
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
        regionRules: enhancedRegionRules[data.region],
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
            2. Regional market conditions
            3. Currency and macroeconomic factors
            4. Financial projections accuracy
            5. Asset valuation appropriateness
            6. Compliance requirements
            7. Growth sustainability
            8. Market positioning
            9. Technology and operational risks

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
        regionRules: enhancedRegionRules[data.region],
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
            3. Financial projection improvements
            4. Currency risk management
            5. Asset valuation optimization
            6. Risk mitigation strategies
            7. Growth optimization opportunities
            8. Operational efficiency
            9. Market positioning enhancement

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