import { z } from "zod";
import { cache } from "../lib/cache";
import type { ValuationFormData } from "../../client/src/lib/validations";

interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mape: number; // Mean Absolute Percentage Error
  confidenceCalibration: number;
}

interface ValidationResult {
  modelName: string;
  metrics: PerformanceMetrics;
  predictions: {
    valuation: number;
    actualValue: number;
    timestamp: number;
    error: number;
  }[];
}

const performanceSchema = z.object({
  accuracy: z.number(),
  precision: z.number(),
  recall: z.number(),
  f1Score: z.number(),
  mape: z.number(),
  confidenceCalibration: z.number(),
});

export class PerformanceTrackingService {
  private readonly CACHE_TTL = 86400; // 24 hours cache

  async trackPrediction(
    modelName: string,
    prediction: {
      valuationId: string;
      predictedValue: number;
      confidence: number;
      metadata: Record<string, any>;
    }
  ) {
    try {
      const predictions = await this.getPredictions(modelName);
      predictions.push({
        ...prediction,
        timestamp: Date.now(),
      });

      await this.storePrediction(modelName, predictions);
    } catch (error) {
      console.error('Error tracking prediction:', error);
      throw new Error('Failed to track prediction');
    }
  }

  async validatePrediction(
    modelName: string,
    valuationId: string,
    actualValue: number
  ) {
    try {
      const predictions = await this.getPredictions(modelName);
      const prediction = predictions.find(p => p.valuationId === valuationId);

      if (!prediction) {
        throw new Error('Prediction not found');
      }

      const error = Math.abs(prediction.predictedValue - actualValue) / actualValue;
      const validationResult = {
        ...prediction,
        actualValue,
        error,
      };

      await this.storeValidation(modelName, validationResult);
      await this.updatePerformanceMetrics(modelName);

      return validationResult;
    } catch (error) {
      console.error('Error validating prediction:', error);
      throw new Error('Failed to validate prediction');
    }
  }

  async getPerformanceMetrics(modelName: string): Promise<PerformanceMetrics> {
    const cacheKey = `performance_metrics_${modelName}`;
    const cachedMetrics = cache.get<PerformanceMetrics>(cacheKey);

    if (cachedMetrics) {
      return cachedMetrics;
    }

    const validations = await this.getValidations(modelName);
    const metrics = this.calculatePerformanceMetrics(validations);

    // Validate metrics
    performanceSchema.parse(metrics);

    // Cache the validated metrics
    cache.set(cacheKey, metrics, this.CACHE_TTL);

    return metrics;
  }

  private async getPredictions(modelName: string) {
    // In production, this would fetch from a database
    return cache.get(`predictions_${modelName}`) || [];
  }

  private async storePrediction(modelName: string, predictions: any[]) {
    // In production, this would store in a database
    cache.set(`predictions_${modelName}`, predictions);
  }

  private async getValidations(modelName: string) {
    // In production, this would fetch from a database
    return cache.get(`validations_${modelName}`) || [];
  }

  private async storeValidation(modelName: string, validation: any) {
    const validations = await this.getValidations(modelName);
    validations.push(validation);
    // In production, this would store in a database
    cache.set(`validations_${modelName}`, validations);
  }

  private async updatePerformanceMetrics(modelName: string) {
    const validations = await this.getValidations(modelName);
    const metrics = this.calculatePerformanceMetrics(validations);
    cache.set(`performance_metrics_${modelName}`, metrics, this.CACHE_TTL);
  }

  private calculatePerformanceMetrics(validations: any[]): PerformanceMetrics {
    if (validations.length === 0) {
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        mape: 0,
        confidenceCalibration: 0,
      };
    }

    // Calculate Mean Absolute Percentage Error (MAPE)
    const mape = validations.reduce((sum, v) => sum + v.error, 0) / validations.length;

    // Calculate accuracy metrics
    const threshold = 0.2; // 20% error threshold
    const truePositives = validations.filter(v => v.error <= threshold).length;
    const falsePositives = validations.filter(v => v.error > threshold).length;

    const accuracy = truePositives / validations.length;
    const precision = truePositives / (truePositives + falsePositives);
    const recall = truePositives / validations.length;
    const f1Score = 2 * (precision * recall) / (precision + recall);

    // Calculate confidence calibration
    const confidenceCalibration = validations.reduce((sum, v) => {
      const expectedConfidence = 1 - v.error;
      return sum + Math.abs(v.confidence - expectedConfidence);
    }, 0) / validations.length;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      mape,
      confidenceCalibration: 1 - confidenceCalibration, // Higher is better
    };
  }
}

export const performanceTrackingService = new PerformanceTrackingService();
