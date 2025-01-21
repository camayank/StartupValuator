import { Router } from 'express';
import { db } from '@db';
import { valuationRecords } from '@db/schema';
import { calculateValuation } from '../lib/valuation';
import type { ValuationFormData } from '../../client/src/lib/validations';
import { z } from 'zod';

const router = Router();

// Request rate limiting
const requestCounts = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || { count: 0, timestamp: now };

  if (now - userRequests.timestamp > RATE_LIMIT_WINDOW) {
    userRequests.count = 1;
    userRequests.timestamp = now;
  } else if (userRequests.count >= MAX_REQUESTS) {
    return false;
  } else {
    userRequests.count++;
  }

  requestCounts.set(ip, userRequests);
  return true;
}

// Create new valuation
router.post('/api/valuations', async (req, res) => {
  try {
    // Check rate limit
    if (!checkRateLimit(req.ip)) {
      return res.status(429).json({ 
        message: 'Rate limit exceeded. Please try again in a few moments.',
        retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (Date.now() - (requestCounts.get(req.ip)?.timestamp || 0))) / 1000)
      });
    }

    const formData: ValuationFormData = req.body;

    // Validate required fields
    if (!formData.businessName || !formData.sector || !formData.stage) {
      return res.status(400).json({ 
        message: 'Missing required fields: businessName, sector, and stage are required' 
      });
    }

    console.log('Starting valuation calculation for:', formData.businessName);
    const valuation = await calculateValuation(formData);
    console.log('Valuation calculation completed');

    // Store the valuation record
    const [record] = await db.insert(valuationRecords).values({
      businessName: formData.businessName,
      industry: formData.sector,
      stage: formData.stage,
      metrics: {
        financial: {
          revenue: formData.revenue || 0,
          margins: formData.margins || 0,
          growthRate: formData.growthRate || 0
        },
        market: {
          size: formData.marketSize || 0,
          share: formData.marketShare || 0
        },
        team: {
          size: formData.teamSize || 0,
          experience: formData.teamExperience || 0
        }
      },
      calculations: {
        methodologies: valuation.methodology,
        weightedAverage: valuation.valuation,
        confidenceScore: valuation.confidenceScore,
        adjustments: {
          marketSentiment: valuation.methodology.marketSentimentAdjustment,
        },
      },
      insights: valuation.aiInsights,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Return the response
    res.json({
      id: record.id,
      valuation,
      message: 'Valuation calculated successfully'
    });

  } catch (error: any) {
    console.error('Valuation API error:', error);

    // Handle specific error cases
    if (error.message.includes('rate limit')) {
      return res.status(429).json({ message: error.message });
    }

    if (error.message.includes('validation')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ 
      message: 'An error occurred while calculating valuation',
      error: error.message
    });
  }
});

// Get industry benchmarks
router.get('/api/benchmarks/:industry/:stage', async (req, res) => {
  try {
    const { industry, stage } = req.params;
    
    const [benchmarks] = await db
      .select()
      .from(industryBenchmarks)
      .where(eq(industryBenchmarks.industry, industry))
      .where(eq(industryBenchmarks.stage, stage))
      .limit(1);

    if (!benchmarks) {
      return res.status(404).json({ message: 'Benchmarks not found' });
    }

    res.json(benchmarks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Generate report
router.post('/api/valuations/:id/report', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const valuationId = parseInt(req.params.id);
    const format = req.body.format || 'pdf';

    const [valuation] = await db
      .select()
      .from(valuationRecords)
      .where(eq(valuationRecords.id, valuationId))
      .limit(1);

    if (!valuation) {
      return res.status(404).json({ message: 'Valuation not found' });
    }

    if (valuation.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate report content (implement actual report generation logic)
    const reportContent = {
      // Add report content structure here
    };

    const [report] = await db.insert(generatedReports).values({
      valuationId,
      userId: req.user.id,
      format,
      content: reportContent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }).returning();

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;