import { z } from "zod";
import type { ValuationFormData } from "../../client/src/lib/validations";
import { ValidationResult } from "../../client/src/lib/types";
import { industries, sectors } from "../../client/src/lib/validations";
import { ErrorLoggingService } from "./error-logging";
import { industryBenchmarkService } from './industry-benchmark-service';

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
  churnRate?: number; // Added churnRate
}

interface PreSeedRequirements {
  tam: number;
  team_score: number;
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
  preSeedData?: PreSeedRequirements;
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

  private static readonly PRE_SEED_REQUIREMENTS = {
    minTAM: 100000, // $100k minimum TAM
    minTeamScore: 1, // Minimum team score
    requiredFields: ['tam', 'team_score'] as const
  };

  static async validateValuationData(data: EnhancedValuationFormData): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      await this.validateBusinessInfo(data, results);
      await this.validatePreSeedRequirements(data, results);
      await this.validateBasicMetrics(data, results);
      await this.validateIndustryMetrics(data, results);
      await this.validateMethodConsistency(data, results);
      await this.validateComprehensive(data, results);
      await this.logValidationResults(data, results);
      return results;
    } catch (error) {
      await ErrorLoggingService.logError(error instanceof Error ? error : 'Validation error occurred', {
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

  private static async validateBusinessInfo(
    data: EnhancedValuationFormData,
    results: ValidationResult[]
  ): Promise<void> {
    const { businessInfo } = data;
    const requiredFields = ['name', 'sector', 'industry', 'location', 'productStage', 'businessModel'];
    const missingFields = requiredFields.filter(field => !businessInfo[field]);

    if (missingFields.length > 0) {
      results.push({
        isValid: false,
        severity: 'error',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        impact: 'high',
        suggestions: [
          'All core business information fields are required',
          'Please provide values for all missing fields'
        ]
      });
    }

    if (!sectors.includes(businessInfo.sector)) {
      results.push({
        isValid: false,
        severity: 'error',
        message: `Invalid sector: ${businessInfo.sector}`,
        impact: 'high',
        suggestions: [
          'Select a sector from the predefined list',
          `Available sectors: ${sectors.join(', ')}`
        ]
      });
    }

    if (!industries[businessInfo.sector]?.includes(businessInfo.industry)) {
      results.push({
        isValid: false,
        severity: 'error',
        message: `Invalid industry for sector ${businessInfo.sector}`,
        impact: 'high',
        suggestions: [
          'Select an industry appropriate for the chosen sector',
          `Available industries: ${industries[businessInfo.sector]?.join(', ')}`
        ]
      });
    }

    const locationRegex = /^[A-Za-z\s,]+$/;
    if (!locationRegex.test(businessInfo.location)) {
      results.push({
        isValid: false,
        severity: 'warning',
        message: 'Location format may be invalid',
        impact: 'medium',
        suggestions: [
          'Use only letters, spaces, and commas',
          'Example format: City, Country'
        ]
      });
    }
  }

  private static async validatePreSeedRequirements(
    data: EnhancedValuationFormData,
    results: ValidationResult[]
  ): Promise<void> {
    if (data.businessInfo.productStage === 'concept' || data.businessInfo.productStage === 'prototype') {
      if (!data.preSeedData) {
        results.push({
          isValid: false,
          severity: 'error',
          message: 'Missing pre-seed validation data',
          impact: 'high',
          suggestions: [
            'Provide Total Addressable Market (TAM)',
            'Include team assessment score'
          ]
        });
        return;
      }

      const { tam, team_score } = data.preSeedData;

      // Validate TAM
      if (tam < this.PRE_SEED_REQUIREMENTS.minTAM) {
        results.push({
          isValid: false,
          severity: 'error',
          message: `TAM must be ≥ $${this.PRE_SEED_REQUIREMENTS.minTAM.toLocaleString()} for Pre-Seed stage`,
          impact: 'high',
          suggestions: [
            'Reassess market size calculation',
            'Consider expanding target market',
            'Include additional revenue streams'
          ]
        });
      }

      // Validate team score
      if (team_score < this.PRE_SEED_REQUIREMENTS.minTeamScore) {
        results.push({
          isValid: false,
          severity: 'error',
          message: 'Team assessment score below minimum threshold',
          impact: 'high',
          suggestions: [
            'Review team composition',
            'Identify key skill gaps',
            'Consider adding advisors or mentors'
          ]
        });
      }
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
            message: 'Very high growth rate projected for early-stage revenue',
            suggestions: [
              'Compare with industry averages',
              'Provide supporting evidence for growth assumptions',
              'Consider market size constraints'
            ],
            impact: 'medium'
          });
        }
      }

      if (financialData.operatingMargin) {
        if (financialData.operatingMargin < this.COMMON_RATIOS.minProfitMargin ||
            financialData.operatingMargin > this.COMMON_RATIOS.maxProfitMargin) {
          results.push({
            isValid: false,
            severity: 'warning',
            message: `Operating margin (${(financialData.operatingMargin * 100).toFixed(1)}%) outside typical range`,
            suggestions: [
              'Review cost assumptions',
              'Compare with competitor margins',
              'Document justification for unusual margins'
            ],
            impact: 'high'
          });
        }
      }

      if (financialData.revenueMultiple) {
        if (financialData.revenueMultiple < this.COMMON_RATIOS.minRevenueMultiple ||
            financialData.revenueMultiple > this.COMMON_RATIOS.maxRevenueMultiple) {
          results.push({
            isValid: false,
            severity: 'warning',
            message: `Revenue multiple (${financialData.revenueMultiple}x) outside typical range`,
            suggestions: [
              'Review comparable company multiples',
              'Consider stage-appropriate multiples',
              'Document justification for multiple'
            ],
            impact: 'high'
          });
        }
      }

      if (financialData.burnRate && financialData.runway) {
        if (financialData.runway < 6) {
          results.push({
            isValid: false,
            severity: 'warning',
            message: 'Short runway detected (less than 6 months)',
            suggestions: [
              'Review burn rate assumptions',
              'Consider additional funding needs',
              'Evaluate cost reduction opportunities'
            ],
            impact: 'critical'
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
      const { businessInfo, financialData } = data;

      const benchmark = industryBenchmarkService.getBenchmark(businessInfo.industry);

      if (!benchmark) {
        results.push({
          isValid: false,
          severity: 'warning',
          message: `No benchmark data available for industry: ${businessInfo.industry}`,
          impact: 'medium',
          suggestions: [
            'Consider selecting a more specific industry category',
            'Compare with similar industries'
          ]
        });
        return;
      }

      const validation = industryBenchmarkService.validateMetrics(businessInfo.industry, {
        ev_revenue: financialData.revenueMultiple,
        growth_rate: financialData.growthRate,
        churn_rate: financialData.churnRate
      });

      if (!validation.valid) {
        validation.warnings.forEach(warning => {
          results.push({
            isValid: false,
            severity: 'warning',
            message: warning,
            impact: 'medium',
            suggestions: [
              'Review industry comparables',
              'Document justification for variance',
              'Consider market conditions'
            ]
          });
        });
      }


      if (financialData.growthRate > benchmark.growth_rate * 2) {
        results.push({
          isValid: false,
          severity: 'warning',
          message: `Growth rate projections (${financialData.growthRate}%) are more than double the industry average`,
          suggestions: [
            'Validate growth assumptions',
            'Document growth drivers',
            'Consider market size constraints'
          ],
          impact: 'high'
        });
      }

    } catch (error) {
      await ErrorLoggingService.logError('Industry metrics validation failed', {
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
      const valuationResults = await this.calculateAllMethodologies(data);
      const consistencyScore = this.assessMethodologyConsistency(valuationResults);

      if (consistencyScore < 0.7) {
        results.push({
          isValid: false,
          severity: 'warning',
          message: 'Significant variations between valuation methods detected',
          suggestions: [
            'Review assumptions across all methods',
            'Check for outliers in financial data',
            'Consider industry-specific adjustments'
          ],
          impact: 'high'
        });

        const meanValue = valuationResults.reduce((sum, r) => sum + r.value, 0) / valuationResults.length;
        valuationResults.forEach(result => {
          const deviation = Math.abs(result.value - meanValue) / meanValue;
          if (deviation > 0.3) {
            results.push({
              isValid: false,
              severity: 'info',
              message: `${result.method} method deviates by ${(deviation * 100).toFixed(1)}%`,
              suggestions: result.factors.map(f => `Review ${f}`),
              impact: 'medium'
            });
          }
        });
      }

    } catch (error) {
      await ErrorLoggingService.logError('Method consistency validation failed', {
        category: 'validation',
        severity: 'high',
        context: { data, metric: 'method-consistency' },
        source: 'validateMethodConsistency'
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
        await ErrorLoggingService.logError('Method calculation failed', {
          category: 'calculation',
          severity: 'medium',
          context: { method, data },
          source: 'calculateAllMethodologies'
        });
      }
    }

    return results;
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
    const projectionYears = 5;
    const discountRate = 0.15;

    let value = 0;
    let currentRevenue = financialData.revenue;

    for (let year = 1; year <= projectionYears; year++) {
      const growthRate = Math.max(financialData.growthRate * Math.pow(0.9, year - 1), 0.15);
      currentRevenue *= (1 + growthRate);
      const operatingMargin = Math.min(financialData.operatingMargin * Math.pow(1.1, year - 1), 0.3);
      const freeCashFlow = currentRevenue * operatingMargin;
      value += freeCashFlow / Math.pow(1 + discountRate, year);
    }

    const terminalGrowthRate = 0.03;
    const terminalValue = (currentRevenue * 0.15) / (discountRate - terminalGrowthRate);
    value += terminalValue / Math.pow(1 + discountRate, projectionYears);

    return value;
  }

  private static calculateMultiple(financialData: EnhancedFinancialData): number {
    return financialData.revenue * financialData.revenueMultiple;
  }

  private static calculateAssetBased(financialData: EnhancedFinancialData): number {
    return (financialData.assets || 0) - (financialData.liabilities || 0);
  }

  private static assessMethodologyConsistency(results: ValuationMethodResult[]): number {
    if (results.length < 2) return 1;

    const values = results.map(r => r.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const maxDeviation = Math.max(...values.map(v => Math.abs(v - mean) / mean));

    return 1 - (maxDeviation / 2);
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
                        'Consider industry-specific adjustments'
                    ],
                    impact: 'high'
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
}