import { z } from "zod";
import type { ValuationFormData } from "../../client/src/lib/validations";
import { ValidationResult } from "../../client/src/lib/types";
import { industries, sectors } from "../../client/src/lib/validations";

export class ValidationService {
  private static readonly COMMON_RATIOS = {
    minRevenueMultiple: 0.5,
    maxRevenueMultiple: 15,
    minEbitdaMultiple: 2,
    maxEbitdaMultiple: 25,
    minProfitMargin: -0.5,
    maxProfitMargin: 0.7,
  };

  static async validateValuationData(data: ValuationFormData): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Basic validation
    await this.validateBasicMetrics(data, results);
    
    // Industry-specific validation
    await this.validateIndustryMetrics(data, results);
    
    // Cross-method validation
    await this.validateMethodConsistency(data, results);
    
    return results;
  }

  private static async validateBasicMetrics(
    data: ValuationFormData,
    results: ValidationResult[]
  ): Promise<void> {
    // Validate revenue trends
    if (data.financialData?.revenue) {
      const { revenue, growthRate } = data.financialData;
      if (growthRate > 200 && revenue < 100000) {
        results.push({
          isValid: false,
          severity: 'warning',
          message: 'Very high growth rate projected for early-stage revenue. Consider revising projections.',
          impact: 'medium'
        });
      }
    }

    // Validate margin consistency
    if (data.financialData?.operatingMargin) {
      const { operatingMargin, industry } = data.financialData;
      const industryBenchmarks = await this.getIndustryBenchmarks(industry);
      if (operatingMargin > industryBenchmarks.maxMargin) {
        results.push({
          isValid: false,
          severity: 'warning',
          message: `Operating margin significantly higher than industry average of ${industryBenchmarks.avgMargin}%`,
          impact: 'high'
        });
      }
    }
  }

  private static async validateIndustryMetrics(
    data: ValuationFormData,
    results: ValidationResult[]
  ): Promise<void> {
    const sector = data.businessInfo?.sector;
    const industry = data.businessInfo?.industry;

    if (!sector || !industry) return;

    // Get industry benchmarks
    const benchmarks = await this.getIndustryBenchmarks(industry);

    // Validate revenue multiples
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

    // Validate growth assumptions
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
  }

  private static async validateMethodConsistency(
    data: ValuationFormData,
    results: ValidationResult[]
  ): Promise<void> {
    const methods = data.valuationInputs?.methodologies || [];
    if (methods.length < 2) return;

    // Calculate valuation range across methods
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
  }

  private static async getIndustryBenchmarks(industry: string) {
    // In production, this would fetch from a database or external API
    return {
      maxMultiple: 12,
      avgMultiple: 8,
      maxMargin: 0.4,
      avgMargin: 0.25,
      maxGrowth: 100,
      avgGrowth: 15
    };
  }

  private static calculateMethodValue(data: ValuationFormData, method: string): number {
    // Implement specific calculation logic for each method
    // This is a placeholder implementation
    return 1000000;
  }
}
