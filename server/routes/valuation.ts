import { Router } from 'express';
import { db } from '@db';
import { valuationRecords, type InsertValuationRecord } from '@db/schema';
import type { ValuationFormData } from '../../client/src/lib/validations';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { ValidationService } from '../services/validation';
import { aiAnalysisService } from '../services/ai-analysis-service';

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
    if (!checkRateLimit(req.ip || '')) {
      return res.status(429).json({ 
        message: 'Rate limit exceeded. Please try again in a few moments.',
        retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (Date.now() - (requestCounts.get(req.ip || '')?.timestamp || 0))) / 1000)
      });
    }

    const formData: ValuationFormData = req.body;

    // Perform validation
    const validationResults = await ValidationService.validateValuationData(formData);
    if (!validationResults.isValid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResults.errors
      });
    }

    // Get AI insights
    const aiAnalysis = await aiAnalysisService.analyzeValuation(formData);

    // Store in database
    const [record] = await db.insert(valuationRecords)
      .values({
        businessInfo: formData.businessInfo,
        financialData: formData.financialData,
        marketData: formData.marketData,
        aiAnalysis,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.json({
      message: 'Valuation calculated successfully',
      record,
      aiAnalysis
    });

  } catch (error: any) {
    console.error('Valuation API error:', error);

    if (error.message.includes('rate limit')) {
      return res.status(429).json({ message: error.message });
    }

    if (error.message.includes('validation')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ 
      message: 'An error occurred while processing valuation data',
      error: error.message
    });
  }
});

// Get valuation by ID
router.get('/api/valuations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [valuation] = await db
      .select()
      .from(valuationRecords)
      .where(eq(valuationRecords.id, id))
      .limit(1);

    if (!valuation) {
      return res.status(404).json({ message: 'Valuation record not found' });
    }

    res.json(valuation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// List valuations
router.get('/api/valuations', async (req, res) => {
  try {
    const valuations = await db
      .select()
      .from(valuationRecords)
      .orderBy(desc(valuationRecords.createdAt));

    res.json(valuations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;