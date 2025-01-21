import { CronJob } from 'cron';
import { benchmarkAPI } from './api/benchmarkAPI';
import { db } from '@db';
import { industries, businessStages } from '@/lib/validations';

interface BenchmarkData {
  industry: string;
  stage: string;
  metrics: {
    revenueMultiple: number;
    ebitdaMultiple: number;
    medianValuation: number;
    avgFundingRound: number;
    marketGrowthRate: number;
  };
  lastUpdated: Date;
}

export class BenchmarkScheduler {
  private job: CronJob;
  private isUpdating: boolean = false;

  constructor() {
    // Run daily at midnight
    this.job = new CronJob('0 0 * * *', this.updateBenchmarks.bind(this));
  }

  start() {
    this.job.start();
    console.log('Benchmark update scheduler started');
  }

  stop() {
    this.job.stop();
    console.log('Benchmark update scheduler stopped');
  }

  private async updateBenchmarks() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      console.log('Starting daily benchmark update...');

      // Update benchmarks for each industry and stage combination
      for (const [industry, name] of Object.entries(industries)) {
        for (const stage of Object.keys(businessStages)) {
          try {
            const benchmarks = await benchmarkAPI.getIndustryBenchmarks(industry, stage);

            // Store in database
            await db.insert('industry_benchmarks').values({
              industry,
              stage,
              data: benchmarks,
              updated_at: new Date()
            }).onConflict(['industry', 'stage']).merge();

            console.log(`Updated benchmarks for ${name} (${stage})`);
          } catch (error) {
            console.error(`Failed to update benchmarks for ${name} (${stage}):`, error);
          }
        }
      }

      console.log('Completed daily benchmark update');
    } finally {
      this.isUpdating = false;
    }
  }
}

export const benchmarkScheduler = new BenchmarkScheduler();