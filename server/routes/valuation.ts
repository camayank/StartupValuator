import { Router } from 'express';
import { db } from '@db';
import { valuationRecords, type InsertValuationRecord, generatedReports, valuationDrafts } from '@db/schema';
import type { ValuationFormData } from '../../client/src/lib/validations';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { ValuationCalculator } from '../services/valuation';
import { openAIService, anthropicService } from '../services/ai-service';
import { ReportGenerator } from '../services/report-generation';

const router = Router();
const calculator = new ValuationCalculator();
const reportGenerator = new ReportGenerator();

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

// Create new valuation with AI insights
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

    console.log('Starting valuation process for:', formData.businessInfo.name);

    // Get AI insights using both services
    const [marketAnalysis, riskAssessment, growthProjections] = await Promise.all([
      openAIService.analyzeMarket(formData),
      anthropicService.analyzeRisks(formData),
      openAIService.generateGrowthProjections(formData)
    ]);

    // Calculate valuation
    const calculatedValuation = await calculator.calculateValuation(formData);

    // Prepare the record
    const valuationRecord = {
      businessInfo: formData.businessInfo,
      marketData: formData.marketData,
      financialData: formData.financialData,
      productDetails: formData.productDetails,
      risksAndOpportunities: {
        ...formData.risksAndOpportunities,
        aiInsights: {
          marketAnalysis,
          riskAssessment,
          growthProjections
        }
      },
      valuationInputs: formData.valuationInputs,
      calculatedValuation: {
        low: calculatedValuation.range.low,
        high: calculatedValuation.range.high,
        methodologies: calculatedValuation.methodologies,
        confidence: calculatedValuation.confidence,
        factors: calculatedValuation.factors
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store the valuation record with AI insights
    const [record] = await db.insert(valuationRecords)
      .values(valuationRecord)
      .returning();

    // Return the response
    res.json({
      id: record.id,
      message: 'Valuation calculated successfully with AI insights',
      valuation: calculatedValuation,
      aiInsights: {
        marketAnalysis,
        riskAssessment,
        growthProjections
      },
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

// Get valuation by ID with AI insights
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


// Add draft routes
router.post('/api/valuations/draft', async (req, res) => {
  try {
    const draftData = req.body;

    // Get existing draft or create new one
    const [existingDraft] = await db
      .select()
      .from(valuationDrafts)
      .where(eq(valuationDrafts.userId, req.user?.id || 0))
      .where(eq(valuationDrafts.isActive, true))
      .limit(1);

    if (existingDraft) {
      // Update existing draft
      const [updatedDraft] = await db
        .update(valuationDrafts)
        .set({
          draftData,
          lastAutosaved: new Date(),
        })
        .where(eq(valuationDrafts.id, existingDraft.id))
        .returning();

      res.json(updatedDraft);
    } else {
      // Create new draft
      const [newDraft] = await db
        .insert(valuationDrafts)
        .values({
          userId: req.user?.id || 0,
          draftData,
          isActive: true,
        })
        .returning();

      res.json(newDraft);
    }
  } catch (error: any) {
    console.error('Draft save error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/api/valuations/draft', async (req, res) => {
  try {
    const [draft] = await db
      .select()
      .from(valuationDrafts)
      .where(eq(valuationDrafts.userId, req.user?.id || 0))
      .where(eq(valuationDrafts.isActive, true))
      .orderBy(desc(valuationDrafts.lastAutosaved))
      .limit(1);

    if (!draft) {
      return res.status(404).json({ message: 'No draft found' });
    }

    res.json(draft.draftData);
  } catch (error: any) {
    console.error('Draft load error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;