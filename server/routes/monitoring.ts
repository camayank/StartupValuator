import { Router } from 'express';
import { db } from '@db';
import { errorLogs } from '@db/schema';
import { desc, sql, eq } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Define response types
interface ErrorStats {
  category: string;
  count: number;
  unresolvedCount: number;
  criticalCount: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  validationErrors: number;
  systemErrors: number;
  apiErrors: number;
  performance: {
    responseTime: number;
    errorRate: number;
    uptimePercentage: number;
  };
}

// Validate timeframe parameter
const timeframeSchema = z.enum(['hour', 'day', 'week']);

// Get error statistics for monitoring dashboard
router.get('/api/monitoring/errors', async (req, res) => {
  try {
    const timeframe = timeframeSchema.parse(req.query.timeframe || 'day');

    const stats = await db
      .select({
        category: errorLogs.category,
        count: sql<number>`count(*)`,
        unresolvedCount: sql<number>`sum(case when resolved = false then 1 else 0 end)`,
        criticalCount: sql<number>`sum(case when severity = 'critical' then 1 else 0 end)`
      })
      .from(errorLogs)
      .where(
        sql`timestamp > now() - interval '1 ${timeframe}'`
      )
      .groupBy(errorLogs.category);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching monitoring stats:', error);
    res.status(500).json({ message: 'Failed to fetch error statistics' });
  }
});

// Get system health metrics
router.get('/api/monitoring/health', async (req, res) => {
  try {
    // Get error counts for the last hour
    const [errorCounts] = await db
      .select({
        total: sql<number>`count(*)`,
        critical: sql<number>`sum(case when severity = 'critical' then 1 else 0 end)`,
        high: sql<number>`sum(case when severity = 'high' then 1 else 0 end)`
      })
      .from(errorLogs)
      .where(sql`timestamp > now() - interval '1 hour'`);

    // Calculate system health status
    const status: SystemHealth['status'] = 
      (errorCounts?.critical || 0) > 0 ? 'critical' :
      (errorCounts?.high || 0) > 3 ? 'degraded' : 
      'healthy';

    // Calculate error rate (errors per minute)
    const errorRate = ((errorCounts?.total || 0) / 60) * 100;

    // Calculate average response time (mock data for now)
    const responseTime = Math.random() * 100 + 50; // 50-150ms

    // Mock uptime calculation (should be replaced with actual uptime monitoring)
    const uptimePercentage = 99.9;

    const healthData: SystemHealth = {
      status,
      validationErrors: errorCounts?.total || 0,
      systemErrors: errorCounts?.high || 0,
      apiErrors: errorCounts?.critical || 0,
      performance: {
        responseTime,
        errorRate,
        uptimePercentage
      }
    };

    res.json(healthData);
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ message: 'Failed to fetch system health metrics' });
  }
});

export default router;