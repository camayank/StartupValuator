import { Router } from 'express';
import { db } from '@db';
import { valuationRecords, type InsertValuationRecord } from '@db/schema';
import type { ValuationFormData } from '../../client/src/lib/validations';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';

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
    if (!formData.businessInfo?.name || !formData.businessInfo?.sector) {
      return res.status(400).json({ 
        message: 'Missing required business information fields' 
      });
    }

    // Additional validations
    if (formData.financialData?.ltv <= formData.financialData?.cac) {
      return res.status(400).json({
        message: 'LTV must be greater than CAC for a sustainable business model'
      });
    }

    if (formData.marketData?.tam < formData.marketData?.sam || 
        formData.marketData?.sam < formData.marketData?.som) {
      return res.status(400).json({
        message: 'Market sizes must follow TAM ≥ SAM ≥ SOM'
      });
    }

    console.log('Starting valuation calculation for:', formData.businessInfo.name);

    // Store the valuation record
    const [record] = await db.insert(valuationRecords).values({
      businessInfo: formData.businessInfo,
      marketData: formData.marketData,
      financialData: formData.financialData,
      productDetails: formData.productDetails,
      risksAndOpportunities: formData.risksAndOpportunities,
      valuationInputs: formData.valuationInputs,
      // Initial calculated valuation (to be updated by AI service)
      calculatedValuation: {
        low: 0,
        high: 0,
        methodologies: {},
        confidence: 0,
        factors: []
      },
      userId: 1, // Using a default user ID since auth is not implemented yet
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Return the response
    res.json({
      id: record.id,
      message: 'Valuation data saved successfully',
      record
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