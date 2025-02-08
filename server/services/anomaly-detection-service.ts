import { z } from "zod";
import { type ValuationFormData } from "../../client/src/lib/validations";
import { OpenAI } from "openai";
import { auditTrailService } from "./audit-trail-service";

// Anomaly detection configuration
const CONFIDENCE_THRESHOLD = 0.8;
const ANOMALY_SEVERITY_LEVELS = {
  LOW: 0.25,
  MEDIUM: 0.5,
  HIGH: 0.75,
} as const;

// Schema for anomaly detection results
const anomalyDetectionSchema = z.object({
  metric: z.string(),
  expected: z.number(),
  actual: z.number(),
  deviation: z.number(),
  confidence: z.number(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  benchmarks: z.array(z.object({
    source: z.string(),
    value: z.number(),
    weight: z.number()
  })),
  explanation: z.string(),
  recommendations: z.array(z.string())
});

export type AnomalyDetectionResult = z.infer<typeof anomalyDetectionSchema>;

class AnomalyDetectionService {
  private openai: OpenAI;
  private historicalData: Map<string, any[]> = new Map();
  private benchmarks: Map<string, any[]> = new Map();

  constructor() {
    this.openai = new OpenAI();
    this.initializeBenchmarks();
  }

  private initializeBenchmarks() {
    // Initialize industry benchmarks and historical data
    // This would typically load from a database
    this.benchmarks.set("revenue_multiple", [
      { sector: "SaaS", value: 10, confidence: 0.9 },
      { sector: "E-commerce", value: 3, confidence: 0.85 },
      { sector: "Fintech", value: 8, confidence: 0.88 }
    ]);
    
    this.benchmarks.set("growth_rate", [
      { stage: "early", min: 0.5, max: 3, confidence: 0.8 },
      { stage: "growth", min: 0.3, max: 1, confidence: 0.85 },
      { stage: "mature", min: 0.1, max: 0.3, confidence: 0.9 }
    ]);
  }

  async detectAnomalies(data: ValuationFormData): Promise<AnomalyDetectionResult[]> {
    try {
      const anomalies: AnomalyDetectionResult[] = [];

      // Check key metrics against benchmarks
      const metrics = this.extractMetrics(data);
      for (const [metric, value] of Object.entries(metrics)) {
        const benchmarkData = await this.getBenchmarkData(metric, data);
        const deviation = this.calculateDeviation(value, benchmarkData);
        
        if (this.isAnomaly(deviation, benchmarkData.confidence)) {
          const severity = this.calculateSeverity(deviation);
          const analysis = await this.analyzeAnomaly(metric, value, benchmarkData, data);
          
          anomalies.push({
            metric,
            expected: benchmarkData.expected,
            actual: value,
            deviation,
            confidence: benchmarkData.confidence,
            severity,
            benchmarks: benchmarkData.sources,
            explanation: analysis.explanation,
            recommendations: analysis.recommendations
          });

          // Record anomaly in audit trail
          await this.recordAnomalyDetection(data.id || 'default', {
            metric,
            severity,
            deviation,
            confidence: benchmarkData.confidence
          });
        }
      }

      return anomalies;
    } catch (error) {
      console.error('Anomaly detection error:', error);
      throw new Error('Failed to detect anomalies');
    }
  }

  private extractMetrics(data: ValuationFormData): Record<string, number> {
    // Extract relevant metrics from valuation data
    const { financials, marketMetrics } = data;
    return {
      revenue_multiple: this.calculateRevenueMultiple(financials),
      growth_rate: this.calculateGrowthRate(financials),
      margin: this.calculateMargin(financials),
      // Add more metrics as needed
    };
  }

  private async getBenchmarkData(metric: string, data: ValuationFormData) {
    const benchmarkData = this.benchmarks.get(metric) || [];
    const sector = data.businessInfo.sector;
    const stage = data.businessInfo.productStage;

    // Calculate expected value based on sector and stage
    const relevantBenchmarks = benchmarkData.filter(b => 
      (b.sector === sector) || (b.stage === stage)
    );

    const expected = relevantBenchmarks.reduce(
      (acc, b) => acc + (b.value * b.confidence),
      0
    ) / relevantBenchmarks.reduce((acc, b) => acc + b.confidence, 0);

    return {
      expected,
      confidence: Math.min(...relevantBenchmarks.map(b => b.confidence)),
      sources: relevantBenchmarks
    };
  }

  private calculateDeviation(actual: number, benchmarkData: any): number {
    return Math.abs((actual - benchmarkData.expected) / benchmarkData.expected);
  }

  private isAnomaly(deviation: number, confidence: number): boolean {
    return deviation > (1 - confidence) * 2;
  }

  private calculateSeverity(deviation: number): "LOW" | "MEDIUM" | "HIGH" {
    if (deviation >= ANOMALY_SEVERITY_LEVELS.HIGH) return "HIGH";
    if (deviation >= ANOMALY_SEVERITY_LEVELS.MEDIUM) return "MEDIUM";
    return "LOW";
  }

  private async analyzeAnomaly(
    metric: string,
    value: number,
    benchmarkData: any,
    context: ValuationFormData
  ) {
    // Use AI to analyze the anomaly and provide insights
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a financial analysis expert. Analyze the anomaly in the metric and provide a clear explanation and actionable recommendations."
        },
        {
          role: "user",
          content: JSON.stringify({
            metric,
            actual: value,
            expected: benchmarkData.expected,
            deviation: this.calculateDeviation(value, benchmarkData),
            context: {
              sector: context.businessInfo.sector,
              stage: context.businessInfo.productStage,
              businessModel: context.businessInfo.businessModel
            }
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private calculateRevenueMultiple(financials: any): number {
    // Implement revenue multiple calculation
    return 0; // Placeholder
  }

  private calculateGrowthRate(financials: any): number {
    // Implement growth rate calculation
    return 0; // Placeholder
  }

  private calculateMargin(financials: any): number {
    // Implement margin calculation
    return 0; // Placeholder
  }

  private async recordAnomalyDetection(valuationId: string, anomaly: any) {
    await auditTrailService.recordAIAssumption(
      'system',
      valuationId,
      {
        type: 'anomaly_detection',
        anomaly,
        timestamp: new Date()
      },
      {
        ipAddress: 'system',
        userAgent: 'AnomalyDetectionService',
        sessionId: 'system'
      }
    );
  }
}

export const anomalyDetectionService = new AnomalyDetectionService();
