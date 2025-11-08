import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { performanceTrackingService } from "./performance-tracking-service";
import { auditTrailService } from "./audit-trail-service";
import type { ValuationFormData } from "../../client/src/lib/validations";

// Model specialization types
type ModelSpecialization = "narrative" | "numerical" | "hybrid";

interface ModelConfig {
  name: string;
  provider: "openai" | "anthropic";
  specialization: ModelSpecialization;
  maxTokens: number;
  baseConfidence: number;
  costPerToken: number;
}

const modelConfigs: Record<string, ModelConfig> = {
  "gpt-4": {
    name: "gpt-4",
    provider: "openai",
    specialization: "narrative",
    maxTokens: 8192,
    baseConfidence: 0.85,
    costPerToken: 0.00003
  },
  "claude-3-opus": {
    name: "claude-3-opus-20240229",
    provider: "anthropic",
    specialization: "numerical",
    maxTokens: 4096,
    baseConfidence: 0.90,
    costPerToken: 0.00002
  }
};

class HybridAIOrchestrator {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private modelPerformanceCache: Map<string, number>;

  constructor() {
    this.openai = new OpenAI();
    this.anthropic = new Anthropic();
    this.modelPerformanceCache = new Map();
  }

  async routeAnalysis(
    data: ValuationFormData,
    analysisType: "narrative" | "numerical" | "hybrid"
  ) {
    const selectedModels = this.selectModels(analysisType, data.complexity || "medium");
    const results = await this.executeParallelAnalysis(selectedModels, data);
    return this.combineResults(results, analysisType);
  }

  private selectModels(
    analysisType: ModelSpecialization,
    complexity: string
  ): ModelConfig[] {
    switch (analysisType) {
      case "narrative":
        return [modelConfigs["gpt-4"]];
      case "numerical":
        return [modelConfigs["claude-3-opus"]];
      case "hybrid":
        return [modelConfigs["gpt-4"], modelConfigs["claude-3-opus"]];
      default:
        throw new Error(`Unsupported analysis type: ${analysisType}`);
    }
  }

  private async executeParallelAnalysis(
    models: ModelConfig[],
    data: ValuationFormData
  ) {
    const analysisPromises = models.map(model =>
      this.executeModelAnalysis(model, data)
    );

    const results = await Promise.allSettled(analysisPromises);
    return results
      .filter((result): result is PromiseFulfilledResult<any> =>
        result.status === "fulfilled"
      )
      .map(result => result.value);
  }

  private async executeModelAnalysis(
    model: ModelConfig,
    data: ValuationFormData
  ) {
    const startTime = Date.now();
    try {
      const result = await this.callModel(model, data);
      const executionTime = Date.now() - startTime;
      
      await this.updateModelPerformance(model.name, result.confidence, executionTime);
      
      return {
        model: model.name,
        result,
        confidence: result.confidence,
        executionTime
      };
    } catch (error) {
      console.error(`Error executing ${model.name}:`, error);
      throw error;
    }
  }

  private async callModel(model: ModelConfig, data: ValuationFormData) {
    const prompt = this.generatePrompt(model.specialization, data);
    
    if (model.provider === "openai") {
      return this.callGPT4(prompt, model);
    } else {
      return this.callClaude(prompt, model);
    }
  }

  private async callGPT4(prompt: string, model: ModelConfig) {
    const response = await this.openai.chat.completions.create({
      model: model.name,
      messages: [
        {
          role: "system",
          content: this.getSystemPrompt(model.specialization)
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async callClaude(prompt: string, model: ModelConfig) {
    const message = await this.anthropic.messages.create({
      model: model.name,
      max_tokens: model.maxTokens,
      system: this.getSystemPrompt(model.specialization),
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    return JSON.parse(message.content[0].text);
  }

  private getSystemPrompt(specialization: ModelSpecialization): string {
    // CRITICAL: Currency specification to prevent USD/INR confusion
    const currencyInstruction = `
CRITICAL CURRENCY INSTRUCTION:
- All monetary values MUST be in Indian Rupees (INR/₹)
- When analyzing financial data, assume all numbers are in INR unless explicitly stated otherwise
- Return ALL calculated values, multiples, valuations, and recommendations in INR
- Use Indian number notation: Lakhs (₹1,00,000 = 100 thousand) and Crores (₹1,00,00,000 = 10 million)
- NEVER assume USD or other currencies
- Example: ₹5 Crore revenue = ₹5,00,00,000 INR (NOT $5 million = ₹41.5 Crore)
    `.trim();

    switch (specialization) {
      case "narrative":
        return `${currencyInstruction}

You are a financial narrative expert specializing in Indian startup valuations.
Focus on the Indian market context, qualitative analysis, market trends, and business model evaluation.
Provide detailed explanations and justifications for your insights tailored to the Indian ecosystem.`;
      case "numerical":
        return `${currencyInstruction}

You are a quantitative analysis expert specializing in financial modeling for Indian startups.
Focus on numerical analysis, metrics evaluation, and statistical modeling.
Ensure high precision in calculations using INR currency and provide confidence intervals.
All financial calculations must account for Indian market multiples and benchmarks.`;
      case "hybrid":
        return `${currencyInstruction}

You are a comprehensive valuation expert combining qualitative and quantitative analysis for Indian startups.
Balance narrative insights with numerical precision.
Provide both detailed explanations and accurate calculations in INR.
Consider both Indian market dynamics and global best practices.`;
      default:
        throw new Error(`Unsupported specialization: ${specialization}`);
    }
  }

  private generatePrompt(specialization: ModelSpecialization, data: ValuationFormData): string {
    // Generate specialized prompts based on the analysis type
    const basePrompt = JSON.stringify(data);
    switch (specialization) {
      case "narrative":
        return `Analyze the following startup data focusing on qualitative aspects:
                Market positioning, competitive advantages, and growth potential.
                ${basePrompt}`;
      case "numerical":
        return `Analyze the following startup data focusing on quantitative aspects:
                Financial metrics, valuation multiples, and growth rates.
                ${basePrompt}`;
      case "hybrid":
        return `Perform a comprehensive analysis of the following startup data:
                Combine qualitative and quantitative insights.
                ${basePrompt}`;
    }
  }

  private async updateModelPerformance(
    modelName: string,
    confidence: number,
    executionTime: number
  ) {
    const currentScore = this.modelPerformanceCache.get(modelName) || 0;
    const newScore = (currentScore + confidence) / 2;
    this.modelPerformanceCache.set(modelName, newScore);

    await performanceTrackingService.trackPrediction(modelName, {
      confidence,
      executionTime,
      timestamp: new Date()
    });
  }

  private combineResults(results: any[], analysisType: ModelSpecialization) {
    if (results.length === 1) {
      return results[0].result;
    }

    // For hybrid analysis, combine results based on model specialization
    const narrativeResult = results.find(r => 
      modelConfigs[r.model].specialization === "narrative"
    );
    const numericalResult = results.find(r =>
      modelConfigs[r.model].specialization === "numerical"
    );

    return {
      qualitativeAnalysis: narrativeResult?.result || {},
      quantitativeAnalysis: numericalResult?.result || {},
      combinedConfidence: this.calculateCombinedConfidence(results),
      metadata: {
        modelPerformance: results.map(r => ({
          model: r.model,
          confidence: r.confidence,
          executionTime: r.executionTime
        }))
      }
    };
  }

  private calculateCombinedConfidence(results: any[]): number {
    const weightedConfidences = results.map(r => ({
      confidence: r.confidence,
      weight: this.modelPerformanceCache.get(r.model) || 0.5
    }));

    const totalWeight = weightedConfidences.reduce((sum, wc) => sum + wc.weight, 0);
    const weightedSum = weightedConfidences.reduce(
      (sum, wc) => sum + (wc.confidence * wc.weight),
      0
    );

    return weightedSum / totalWeight;
  }
}

export const hybridAIOrchestrator = new HybridAIOrchestrator();
