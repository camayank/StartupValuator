import { Router } from 'express';
import { db } from '@db';
import { valuationRecords, industryBenchmarks, generatedReports } from '@db/schema';
import { calculateValuation } from '../lib/valuation';
import type { ValuationFormData } from '../../client/src/lib/validations';
import { eq } from 'drizzle-orm';

const router = Router();

// Create new valuation
router.post('/api/valuations', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const formData: ValuationFormData = req.body;
    const valuation = await calculateValuation(formData);

    const [record] = await db.insert(valuationRecords).values({
      userId: req.user.id,
      businessName: formData.businessName,
      industry: formData.industry,
      stage: formData.stage,
      metrics: {
        financial: formData.financialMetrics || {},
        industry: formData.industryMetrics || {},
        custom: formData.customMetrics || [],
      },
      calculations: {
        methodologies: {
          dcf: valuation.details.methods.dcf.value,
          comparables: valuation.details.methods.comparables.value,
          riskAdjusted: valuation.details.methods.riskAdjusted.value,
        },
        weightedAverage: valuation.valuation,
        adjustments: {
          marketSentiment: valuation.methodology.marketSentimentAdjustment,
        },
      },
    }).returning();

    res.json({
      id: record.id,
      valuation,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
