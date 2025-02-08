import { Router } from 'express';
import { db } from '@db';
import { valuationRecords, type InsertValuationRecord, generatedReports, valuationDrafts } from '@db/schema';
import type { ValuationFormData } from '../../client/src/lib/validations';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { ValuationCalculator } from '../services/valuation';
import { openAIService, anthropicService } from '../services/ai-service';
import { ReportGenerator } from '../services/report-generation';
import { ValidationService } from '../services/validation';
import OpenAI from 'openai';
import Express from 'express';


const router = Router();
const calculator = new ValuationCalculator();
const reportGenerator = new ReportGenerator();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Authentication middleware
function requireAuth(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  next();
}

// Apply authentication middleware to all valuation routes
router.use(requireAuth);

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

    // Perform comprehensive validation
    const validationResults = await ValidationService.validateValuationData(formData);
    const hasErrors = validationResults.some(r => !r.isValid && r.severity === 'error');

    if (hasErrors) {
      return res.status(400).json({
        message: 'Validation failed',
        validationResults
      });
    }

    const hasWarnings = validationResults.some(r => !r.isValid && r.severity === 'warning');

    // Get AI insights using both services
    const [marketAnalysis, riskAssessment, growthProjections] = await Promise.all([
      openAIService.analyzeMarket(formData),
      anthropicService.analyzeRisks(formData),
      openAIService.generateGrowthProjections(formData)
    ]);

    // Calculate valuation
    const calculatedValuation = await calculator.calculateValuation(formData);

    // Prepare the record with validation results
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
      validationResults,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store the valuation record with AI insights and validation results
    const [record] = await db.insert(valuationRecords)
      .values(valuationRecord)
      .returning();

    // Return the response
    res.json({
      id: record.id,
      message: hasWarnings 
        ? 'Valuation calculated with warnings. Please review the validation results.'
        : 'Valuation calculated successfully with AI insights',
      valuation: calculatedValuation,
      aiInsights: {
        marketAnalysis,
        riskAssessment,
        growthProjections
      },
      validationResults,
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

// Add report generation endpoints
router.post('/api/valuations/:id/report', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { format = 'pdf', template = 'default' } = req.body;

    // Get valuation data
    const [valuation] = await db
      .select()
      .from(valuationRecords)
      .where(eq(valuationRecords.id, id))
      .limit(1);

    if (!valuation) {
      return res.status(404).json({ message: 'Valuation record not found' });
    }

    // Generate report using ReportGenerator service
    const report = await reportGenerator.generateReport(valuation, {
      format,
      template,
      includeExecutiveSummary: true,
      includeMethodComparison: true,
      includeMarketAnalysis: true,
      includeAIInsights: true
    });

    // Update export history
    await db.update(valuationRecords)
      .set({
        exportHistory: {
          exports: [
            ...(valuation.exportHistory?.exports || []),
            {
              type: format,
              timestamp: new Date().toISOString(),
              version: valuation.version
            }
          ]
        }
      })
      .where(eq(valuationRecords.id, id));

    // Set appropriate headers based on format
    switch (format) {
      case 'pdf':
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="valuation-report-${id}.pdf"`);
        break;
      case 'excel':
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="valuation-report-${id}.xlsx"`);
        break;
      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="valuation-report-${id}.csv"`);
        break;
    }

    res.send(report);
  } catch (error: any) {
    console.error('Report generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate report',
      error: error.message 
    });
  }
});

// Add method comparison endpoint
router.get('/api/valuations/:id/compare-methods', async (req, res) => {
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

    // Generate comparison data using ValuationCalculator
    const methodComparison = await calculator.compareMethodologies(valuation);

    res.json(methodComparison);
  } catch (error: any) {
    console.error('Method comparison error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add executive summary endpoint
router.get('/api/valuations/:id/executive-summary', async (req, res) => {
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

    // Generate executive summary using OpenAI
    const summary = await openAIService.generateExecutiveSummary(valuation);

    res.json(summary);
  } catch (error: any) {
    console.error('Executive summary generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/api/ai-valuation', async (req, res) => {
  try {
    const formData = req.body;

    const prompt = `
      Please analyze this startup and provide a valuation with detailed rationale:

      Business Information:
      - Name: ${formData.businessInfo.name}
      - Sector: ${formData.businessInfo.sector}
      - Industry: ${formData.businessInfo.industry}
      - Stage: ${formData.businessInfo.productStage}

      Market Data:
      - TAM: ${formData.marketData.tam}
      - SAM: ${formData.marketData.sam}
      - SOM: ${formData.marketData.som}
      - Growth Rate: ${formData.marketData.growthRate}%

      Financial Data:
      - Revenue: ${formData.financialData.revenue}
      - CAC: ${formData.financialData.cac}
      - LTV: ${formData.financialData.ltv}
      - Burn Rate: ${formData.financialData.burnRate}

      Please provide:
      1. Estimated valuation range
      2. Key factors influencing the valuation
      3. Confidence score (0-100)
      4. Strategic recommendations
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "You are an expert startup valuation analyst. Analyze the provided business data and generate a detailed valuation response."
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;

    // Parse the response
    const valuationMatch = content.match(/\$(\d+(?:\.\d+)?)\s*(?:million|M|-\s*\$\d+(?:\.\d+)?M)?/);
    const confidenceMatch = content.match(/confidence(?:\s+score)?[:]\s*(\d+)/i);
    const recommendationsMatch = content.match(/recommendations?:?\n((?:[-*]\s*.+\n?)+)/i);
    const rationaleMatch = content.match(/factors?:?\n((?:[-*]\s*.+\n?)+)/i);

    const aiResponse = {
      valuation: valuationMatch ? parseFloat(valuationMatch[1]) * 1000000 : 1000000,
      rationale: rationaleMatch 
        ? rationaleMatch[1].replace(/[-*]\s*/g, '').trim()
        : "Based on market comparables and growth metrics",
      confidenceScore: confidenceMatch ? parseInt(confidenceMatch[1]) : 85,
      recommendations: recommendationsMatch 
        ? recommendationsMatch[1].split('\n')
            .filter(r => r.trim())
            .map(r => r.replace(/^[-*]\s*/, '').trim())
        : ["Focus on reducing CAC", "Expand market presence", "Invest in product development"]
    };

    res.json(aiResponse);
  } catch (error: any) {
    console.error('AI Valuation Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate AI-powered valuation',
      error: error.message 
    });
  }
});

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


export default router;