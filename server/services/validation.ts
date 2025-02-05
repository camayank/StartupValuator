import { z } from "zod";
import type { ValuationFormData } from "../../client/src/lib/validations";
import { ValidationResult } from "../../client/src/lib/types";
import { industries, sectors } from "../../client/src/lib/validations";
import { ErrorLoggingService } from "./error-logging";

interface EnhancedFinancialData {
  revenue: number;
  cac: number;
  ltv: number;
  burnRate: number;
  runway: number;
  growthRate: number; // Make required
  operatingMargin: number; // Make required
  industry: string; // Make required
  revenueMultiple: number; // Make required
  projectedGrowth: number; // Make required
}

interface EnhancedValuationFormData extends ValuationFormData {
  businessInfo: {
    id?: number;
    name: string;
    sector: string;
    industry: string;
    location: string;
    productStage: string;
    businessModel: string;
  };
  financialData: EnhancedFinancialData;
  valuationInputs: {
    methodologies: string[]; // Make required
    targetValuation: number;
    fundingRequired: number;
    expectedROI: number;
  };
}

export class ValidationService {
  private static readonly COMMON_RATIOS = {
    minRevenueMultiple: 0.5,
    maxRevenueMultiple: 15,
    minEbitdaMultiple: 2,
    maxEbitdaMultiple: 25,
    minProfitMargin: -0.5,
    maxProfitMargin: 0.7,
  };

  static async validateValuationData(data: EnhancedValuationFormData): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      await this.validateBasicMetrics(data, results);
      await this.validateIndustryMetrics(data, results);
      await this.validateMethodConsistency(data, results);
      await this.logValidationResults(data, results);
      return results;
    } catch (error) {
      await ErrorLoggingService.logError(error, {
        category: 'validation',
        severity: 'high',
        context: { data, results },
        source: 'ValidationService'
      });

      results.push({
        isValid: false,
        severity: 'error',
        message: 'Validation system error occurred',
        impact: 'high'
      });

      return results;
    }
  }

  private static async validateBasicMetrics(
    data: EnhancedValuationFormData,
    results: ValidationResult[]
  ): Promise<void> {
    try {
      const { financialData } = data;

      if (financialData.revenue && financialData.growthRate) {
        if (financialData.growthRate > 200 && financialData.revenue < 100000) {
          results.push({
            isValid: false,
            severity: 'warning',
            message: 'Very high growth rate projected for early-stage revenue. Consider revising projections.',
            suggestions: [
              'Compare with industry averages',
              'Provide supporting evidence for growth assumptions',
              'Consider market size constraints'
            ],
            impact: 'medium'
          });
        }
      }

      if (financialData.operatingMargin && financialData.industry) {
        const industryBenchmarks = await this.getIndustryBenchmarks(financialData.industry);
        if (financialData.operatingMargin > industryBenchmarks.maxMargin) {
          results.push({
            isValid: false,
            severity: 'warning',
            message: `Operating margin significantly higher than industry average of ${industryBenchmarks.avgMargin}%`,
            suggestions: [
              'Review cost assumptions',
              'Compare with competitor margins',
              'Document justification for premium margins'
            ],
            impact: 'high'
          });
        }
      }
    } catch (error) {
      await ErrorLoggingService.logError('Basic metrics validation failed', {
        category: 'validation',
        severity: 'medium',
        context: { data, metric: 'basic' },
        source: 'validateBasicMetrics'
      });
      throw error;
    }
  }

  private static async validateIndustryMetrics(
    data: EnhancedValuationFormData,
    results: ValidationResult[]
  ): Promise<void> {
    try {
      const sector = data.businessInfo?.sector;
      const industry = data.businessInfo?.industry;

      if (!sector || !industry) return;

      const benchmarks = await this.getIndustryBenchmarks(industry);

      if (data.financialData?.revenueMultiple) {
        const { revenueMultiple } = data.financialData;
        if (revenueMultiple > benchmarks.maxMultiple) {
          results.push({
            isValid: false,
            severity: 'warning',
            message: `Revenue multiple (${revenueMultiple}x) is significantly higher than industry average (${benchmarks.avgMultiple}x)`,
            suggestions: [
              'Review recent comparable company transactions',
              'Consider adjusting for company-specific risk factors',
              'Document justification for premium valuation'
            ],
            impact: 'high'
          });
        }
      }

      if (data.financialData?.projectedGrowth) {
        const { projectedGrowth } = data.financialData;
        if (projectedGrowth > benchmarks.maxGrowth) {
          results.push({
            isValid: false,
            severity: 'warning',
            message: `Projected growth rate (${projectedGrowth}%) exceeds industry maximum (${benchmarks.maxGrowth}%)`,
            suggestions: [
              'Review market size and penetration assumptions',
              'Consider competitive dynamics',
              'Validate growth sustainability'
            ],
            impact: 'medium'
          });
        }
      }
    } catch (error) {
      await ErrorLoggingService.logError(error, {
        category: 'validation',
        severity: 'medium',
        context: { data, metric: 'industry' },
        source: 'validateIndustryMetrics'
      });
      throw error;
    }
  }

  private static async validateMethodConsistency(
    data: EnhancedValuationFormData,
    results: ValidationResult[]
  ): Promise<void> {
    try {
      const methods = data.valuationInputs?.methodologies || [];
      if (methods.length < 2) return;

      const valuations = methods.map(m => this.calculateMethodValue(data, m));
      const avgValuation = valuations.reduce((a, b) => a + b, 0) / valuations.length;
      const maxDeviation = Math.max(...valuations.map(v => Math.abs(v - avgValuation) / avgValuation));

      if (maxDeviation > 0.5) {
        results.push({
          isValid: false,
          severity: 'warning',
          message: 'Large discrepancy between valuation methods (>50% deviation)',
          suggestions: [
            'Review assumptions for each method',
            'Consider industry-specific factors affecting each approach',
            'Document justification for variations'
          ],
          impact: 'high'
        });
      }
    } catch (error) {
      await ErrorLoggingService.logError(error, {
        category: 'validation',
        severity: 'high',
        context: { data, metric: 'method-consistency' },
        source: 'validateMethodConsistency'
      });
      throw error;
    }
  }

  private static async logValidationResults(
    data: EnhancedValuationFormData,
    results: ValidationResult[]
  ): Promise<void> {
    const hasErrors = results.some(r => r.severity === 'error');
    const hasWarnings = results.some(r => r.severity === 'warning');

    if (hasErrors || hasWarnings) {
      await ErrorLoggingService.logError('Validation issues detected', {
        category: 'validation',
        severity: hasErrors ? 'high' : 'medium',
        context: {
          businessInfo: {
            name: data.businessInfo.name,
            sector: data.businessInfo.sector,
            industry: data.businessInfo.industry
          },
          results: results.filter(r => !r.isValid),
          timestamp: new Date()
        },
        source: 'ValidationService'
      });
    }
  }

  private static async getIndustryBenchmarks(industry: string) {
    return {
      maxMultiple: 12,
      avgMultiple: 8,
      maxMargin: 0.4,
      avgMargin: 0.25,
      maxGrowth: 100,
      avgGrowth: 15
    };
  }

  private static calculateMethodValue(data: EnhancedValuationFormData, method: string): number {
    return 1000000;
  }
}