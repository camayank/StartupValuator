import { Router } from 'express';
import { db } from '@db';
import { valuationRecords, type InsertValuationRecord, generatedReports } from '@db/schema';
import type { ValuationFormData } from '../../client/src/lib/validations';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { ValuationCalculator } from '../services/valuation';
import { AIValuationService } from '../services/ai-valuation';
import { ReportGenerator } from '../services/report-generation';

const router = Router();
const calculator = new ValuationCalculator();
const aiService = new AIValuationService();
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

    console.log('Starting valuation process for:', formData.businessInfo.name);

    // Auto-complete missing fields if necessary
    if (Object.values(formData).some(v => !v)) {
      const completedData = await aiService.autoCompleteMissingFields(formData);
      formData = { ...formData, ...completedData };
    }

    // Get AI insights
    const [marketAnalysis, riskAssessment, growthProjections] = await Promise.all([
      aiService.analyzeMarket(formData),
      aiService.assessRisks(formData),
      aiService.generateGrowthProjections(formData)
    ]);

    // Calculate valuation
    const calculatedValuation = await calculator.calculateValuation(formData);

    // Store the valuation record with AI insights
    const [record] = await db.insert(valuationRecords).values({
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
      userId: 1, // Using a default user ID since auth is not implemented yet
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

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

    // If AI insights are missing, generate them
    if (!valuation.risksAndOpportunities.aiInsights) {
      const [marketAnalysis, riskAssessment, growthProjections] = await Promise.all([
        aiService.analyzeMarket(valuation),
        aiService.assessRisks(valuation),
        aiService.generateGrowthProjections(valuation)
      ]);

      // Update the record with AI insights
      const [updatedValuation] = await db
        .update(valuationRecords)
        .set({
          risksAndOpportunities: {
            ...valuation.risksAndOpportunities,
            aiInsights: {
              marketAnalysis,
              riskAssessment,
              growthProjections
            }
          },
          updatedAt: new Date()
        })
        .where(eq(valuationRecords.id, id))
        .returning();

      res.json(updatedValuation);
    } else {
      res.json(valuation);
    }
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

// Generate report endpoint
router.post('/api/valuations/:id/report', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const format = req.body.format || 'pdf';

    // Get valuation data
    const [valuation] = await db
      .select()
      .from(valuationRecords)
      .where(eq(valuationRecords.id, id))
      .limit(1);

    if (!valuation) {
      return res.status(404).json({ message: 'Valuation not found' });
    }

    let reportBuffer: Buffer;
    let contentType: string;
    let filename: string;

    // Generate report in requested format
    if (format === 'pdf') {
      reportBuffer = await reportGenerator.generatePDFReport(valuation);
      contentType = 'application/pdf';
      filename = 'valuation-report.pdf';
    } else if (format === 'excel') {
      reportBuffer = await reportGenerator.generateExcelReport(valuation);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = 'valuation-report.xlsx';
    } else {
      return res.status(400).json({ message: 'Invalid format requested' });
    }

    // Store report in database
    const [report] = await db.insert(generatedReports).values({
      valuationId: id,
      userId: 1, // Default user ID for now
      format,
      content: {
        timestamp: new Date().toISOString(),
        format,
        size: reportBuffer.length,
      },
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
    }).returning();

    // Send report to client
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(reportBuffer);

  } catch (error: any) {
    console.error('Report generation failed:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to generate report'
    });
  }
});

// Get all reports for a valuation
router.get('/api/valuations/:id/reports', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const reports = await db
      .select()
      .from(generatedReports)
      .where(eq(generatedReports.valuationId, id))
      .orderBy(desc(generatedReports.generatedAt));

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;