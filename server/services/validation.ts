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
  growthRate: number;
  operatingMargin: number;
  industry: string;
  revenueMultiple: number;
  projectedGrowth: number;
  ebitda?: number;
  netIncome?: number;
  cashFlow?: number;
  assets?: number;
  liabilities?: number;
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
    methodologies: string[];
    targetValuation: number;
    fundingRequired: number;
    expectedROI: number;
  };
}

interface ValuationMethodResult {
  method: string;
  value: number;
  confidence: number;
  factors: string[];
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
      // First pass: Basic validation
      await this.validateBasicMetrics(data, results);

      // Second pass: Industry-specific validation
      await this.validateIndustryMetrics(data, results);

      // Third pass: Cross-method validation
      await this.validateMethodConsistency(data, results);

      // Final pass: Comprehensive validation
      await this.validateComprehensive(data, results);

      // Log validation results
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

  private static async validateComprehensive(
    data: EnhancedValuationFormData,
    results: ValidationResult[]
  ): Promise<void> {
    try {
      const valuationResults = await this.calculateAllMethodologies(data);
      const consistencyScore = this.assessMethodologyConsistency(valuationResults);

      if (consistencyScore < 0.7) { // 70% consistency threshold
        results.push({
          isValid: false,
          severity: 'warning',
          message: 'Significant variations between valuation methods detected',
          suggestions: [
            'Review assumptions across all methods',
            'Check for outliers in financial data',
            'Consider industry-specific adjustments',
            'Document justification for variations'
          ],
          impact: 'high',
          details: {
            consistencyScore,
            methodResults: valuationResults.map(r => ({
              method: r.method,
              deviation: r.confidence
            }))
          }
        });
      }

      // Validate against industry benchmarks
      const benchmarks = await this.getIndustryBenchmarks(data.businessInfo.industry);
      this.validateAgainstBenchmarks(data, benchmarks, results);
    } catch (error) {
      await ErrorLoggingService.logError(error, {
        category: 'validation',
        severity: 'high',
        context: { data, metric: 'comprehensive' },
        source: 'validateComprehensive'
      });
      throw error;
    }
  }

  private static async calculateAllMethodologies(
    data: EnhancedValuationFormData
  ): Promise<ValuationMethodResult[]> {
    const results: ValuationMethodResult[] = [];
    const methods = data.valuationInputs.methodologies;

    for (const method of methods) {
      try {
        const result = await this.calculateMethodValue(data, method);
        results.push(result);
      } catch (error) {
        await ErrorLoggingService.logError(error, {
          category: 'calculation',
          severity: 'medium',
          context: { method, data },
          source: 'calculateAllMethodologies'
        });
      }
    }

    return results;
  }

  private static assessMethodologyConsistency(results: ValuationMethodResult[]): number {
    if (results.length < 2) return 1;

    const values = results.map(r => r.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const maxDeviation = Math.max(...values.map(v => Math.abs(v - mean) / mean));

    // Return a score between 0 and 1, where 1 is perfect consistency
    return 1 - (maxDeviation / 2); // Normalize the deviation
  }

  private static async validateAgainstBenchmarks(
    data: EnhancedValuationFormData,
    benchmarks: any,
    results: ValidationResult[]
  ): Promise<void> {
    const { financialData } = data;

    // Validate revenue multiple
    if (financialData.revenueMultiple > benchmarks.maxMultiple * 1.5) {
      results.push({
        isValid: false,
        severity: 'warning',
        message: `Revenue multiple significantly exceeds industry maximum (${benchmarks.maxMultiple}x)`,
        suggestions: [
          'Review comparable company multiples',
          'Document growth assumptions',
          'Consider market conditions'
        ],
        impact: 'high'
      });
    }

    // Validate growth projections
    if (financialData.projectedGrowth > benchmarks.maxGrowth * 1.3) {
      results.push({
        isValid: false,
        severity: 'warning',
        message: `Growth projections exceed typical industry maximum by >30%`,
        suggestions: [
          'Validate growth assumptions',
          'Compare to historical performance',
          'Consider market size constraints'
        ],
        impact: 'medium'
      });
    }
  }

  private static async calculateMethodValue(
    data: EnhancedValuationFormData, 
    method: string
  ): Promise<ValuationMethodResult> {
    const { financialData } = data;
    let value = 0;
    let confidence = 0;
    const factors: string[] = [];

    switch (method.toLowerCase()) {
      case 'dcf':
        value = this.calculateDCF(financialData);
        confidence = 0.8;
        factors.push('Growth rate', 'Cash flow projections', 'Discount rate');
        break;
      case 'multiple':
        value = this.calculateMultiple(financialData);
        confidence = 0.85;
        factors.push('Revenue multiple', 'Industry benchmarks', 'Company stage');
        break;
      case 'asset':
        value = this.calculateAssetBased(financialData);
        confidence = 0.9;
        factors.push('Asset value', 'Liability adjustments', 'Intangible assets');
        break;
      default:
        value = 0;
        confidence = 0;
    }

    return { method, value, confidence, factors };
  }

  private static calculateDCF(financialData: EnhancedFinancialData): number {
    // Implement DCF calculation logic
    return financialData.revenue * 5;
  }

  private static calculateMultiple(financialData: EnhancedFinancialData): number {
    // Implement multiple-based calculation
    return financialData.revenue * financialData.revenueMultiple;
  }

  private static calculateAssetBased(financialData: EnhancedFinancialData): number {
    // Implement asset-based calculation
    return (financialData.assets || 0) - (financialData.liabilities || 0);
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
}