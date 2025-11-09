/**
 * API Routes for Indian Startup Benchmarking
 */

import { Router, type Request, Response } from 'express';
import {
  getBenchmarkData,
  getSectorBenchmarks,
  compareAgainstBenchmark,
  getAvailableSectors,
  getAvailableStages,
} from '../services/indian-benchmark-service';

const router = Router();

/**
 * GET /api/benchmarks/sectors
 * Get list of all available sectors with benchmark data
 */
router.get('/sectors', (req: Request, res: Response) => {
  try {
    const sectors = getAvailableSectors();

    return res.json({
      success: true,
      sectors,
      count: sectors.length,
    });
  } catch (error) {
    console.error('Error fetching sectors:', error);
    return res.status(500).json({
      error: 'Failed to fetch sectors',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/benchmarks/:sector/stages
 * Get available stages for a specific sector
 */
router.get('/:sector/stages', (req: Request, res: Response) => {
  try {
    const { sector } = req.params;
    const stages = getAvailableStages(sector);

    if (stages.length === 0) {
      return res.status(404).json({
        error: 'Sector not found',
        message: `No benchmark data available for sector: ${sector}`,
      });
    }

    return res.json({
      success: true,
      sector,
      stages,
      count: stages.length,
    });
  } catch (error) {
    console.error('Error fetching stages:', error);
    return res.status(500).json({
      error: 'Failed to fetch stages',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/benchmarks/:sector/:stage
 * Get benchmark data for a specific sector and stage
 */
router.get('/:sector/:stage', (req: Request, res: Response) => {
  try {
    const { sector, stage } = req.params;
    const region = (req.query.region as string) || 'india';

    const benchmark = getBenchmarkData(sector, stage, region);

    if (!benchmark) {
      return res.status(404).json({
        error: 'Benchmark not found',
        message: `No benchmark data available for ${sector} at ${stage} stage in ${region}`,
      });
    }

    return res.json({
      success: true,
      benchmark,
    });
  } catch (error) {
    console.error('Error fetching benchmark:', error);
    return res.status(500).json({
      error: 'Failed to fetch benchmark',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/benchmarks/:sector
 * Get all benchmarks for a sector across all stages
 */
router.get('/:sector', (req: Request, res: Response) => {
  try {
    const { sector } = req.params;
    const benchmarks = getSectorBenchmarks(sector);

    if (benchmarks.length === 0) {
      return res.status(404).json({
        error: 'Sector not found',
        message: `No benchmark data available for sector: ${sector}`,
      });
    }

    return res.json({
      success: true,
      sector,
      benchmarks,
      count: benchmarks.length,
    });
  } catch (error) {
    console.error('Error fetching sector benchmarks:', error);
    return res.status(500).json({
      error: 'Failed to fetch sector benchmarks',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/benchmarks/compare
 * Compare a startup's metrics against benchmarks
 */
router.post('/compare', (req: Request, res: Response) => {
  try {
    const { sector, stage, metrics } = req.body;

    if (!sector || !stage) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'sector and stage are required',
      });
    }

    if (!metrics || typeof metrics !== 'object') {
      return res.status(400).json({
        error: 'Invalid metrics',
        message: 'metrics object is required',
      });
    }

    const result = compareAgainstBenchmark(sector, stage, metrics);

    if (!result.benchmark) {
      return res.status(404).json({
        error: 'Benchmark not found',
        message: `No benchmark data available for ${sector} at ${stage} stage`,
      });
    }

    return res.json({
      success: true,
      sector,
      stage,
      yourMetrics: metrics,
      benchmark: result.benchmark.metrics,
      comparison: result.comparison,
    });
  } catch (error) {
    console.error('Error comparing against benchmark:', error);
    return res.status(500).json({
      error: 'Failed to compare against benchmark',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
