import { readFile } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

export interface IndustryBenchmark {
  industry: string;
  ev_revenue: number;
  pe_ratio: number;
  growth_rate: number;
  gross_margin: number;
  churn_rate: number;
  ltv_cac_ratio: number;
}

const benchmarkSchema = z.object({
  industry: z.string(),
  ev_revenue: z.number().positive(),
  pe_ratio: z.number().positive(),
  growth_rate: z.number().min(0).max(100),
  gross_margin: z.number().min(0).max(100),
  churn_rate: z.number().min(0).max(100),
  ltv_cac_ratio: z.number().positive()
});

export class IndustryBenchmarkService {
  private static instance: IndustryBenchmarkService;
  private benchmarks: Map<string, IndustryBenchmark> = new Map();

  private constructor() {}

  public static getInstance(): IndustryBenchmarkService {
    if (!IndustryBenchmarkService.instance) {
      IndustryBenchmarkService.instance = new IndustryBenchmarkService();
    }
    return IndustryBenchmarkService.instance;
  }

  async loadBenchmarks(): Promise<void> {
    try {
      const filePath = join(process.cwd(), 'data', 'industry_benchmarks.csv');
      const fileContent = await readFile(filePath, 'utf-8');
      
      const rows = fileContent.split('\n');
      const headers = rows[0].split(',');
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;
        
        const values = row.split(',');
        const benchmark = headers.reduce((obj, header, index) => {
          obj[header.trim()] = header === 'industry' ? values[index] : Number(values[index]);
          return obj;
        }, {} as Record<string, string | number>);
        
        const parsedBenchmark = benchmarkSchema.parse(benchmark);
        this.benchmarks.set(parsedBenchmark.industry, parsedBenchmark);
      }
    } catch (error) {
      console.error('Error loading industry benchmarks:', error);
      throw new Error('Failed to load industry benchmarks');
    }
  }

  getBenchmark(industry: string): IndustryBenchmark | undefined {
    return this.benchmarks.get(industry);
  }

  validateMetrics(industry: string, metrics: Partial<IndustryBenchmark>): {
    valid: boolean;
    warnings: string[];
  } {
    const benchmark = this.getBenchmark(industry);
    if (!benchmark) {
      return {
        valid: false,
        warnings: ['Industry benchmark data not found']
      };
    }

    const warnings: string[] = [];

    // Check each metric against benchmark
    if (metrics.ev_revenue && metrics.ev_revenue > benchmark.ev_revenue * 1.5) {
      warnings.push(`EV/Revenue ratio (${metrics.ev_revenue}) is significantly higher than industry average (${benchmark.ev_revenue})`);
    }

    if (metrics.pe_ratio && metrics.pe_ratio > benchmark.pe_ratio * 1.5) {
      warnings.push(`P/E ratio (${metrics.pe_ratio}) is significantly higher than industry average (${benchmark.pe_ratio})`);
    }

    if (metrics.growth_rate && metrics.growth_rate > benchmark.growth_rate * 1.5) {
      warnings.push(`Growth rate (${metrics.growth_rate}%) is significantly higher than industry average (${benchmark.growth_rate}%)`);
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  }
}

export const industryBenchmarkService = IndustryBenchmarkService.getInstance();
