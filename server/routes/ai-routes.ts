import { Router } from 'express';
import { enhancedAIService } from '../services/enhanced-ai-service';
import { performanceTrackingService } from '../services/performance-tracking-service';
import { auditTrailService } from '../services/audit-trail-service';
import { validationService } from '../services/validation-service';
import { z } from 'zod';

const router = Router();

// Validation schemas
const validationRequestSchema = z.object({
  valuationId: z.string(),
  actualValue: z.number(),
  modelName: z.string(),
});

const expertValidationSchema = z.object({
  valuationId: z.string(),
  expertId: z.string(),
  status: z.enum(["approved", "rejected", "requires_review"]),
  comments: z.string(),
  adjustments: z.record(z.unknown()).optional(),
});

// Get AI-enhanced market analysis
router.post('/market-analysis', async (req, res) => {
  try {
    const analysis = await enhancedAIService.analyzeMarket(req.body);

    // Perform compliance checks
    const compliance = await validationService.performComplianceCheck(
      req.body.id || 'default',
      req.body
    );

    // Validate assumptions
    const validatedAssumptions = await validationService.validateAssumptions(
      req.body.id || 'default',
      analysis.justification,
      req.user?.id || 'system',
      {
        ipAddress: req.ip || 'system',
        userAgent: req.headers['user-agent'] || 'system',
        sessionId: req.sessionID || 'system'
      }
    );

    res.json({
      analysis,
      compliance,
      validatedAssumptions,
      requiresReview: validatedAssumptions.some(v => v.requiresReview)
    });
  } catch (error) {
    console.error('Market analysis error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to analyze market'
    });
  }
});

// Expert validation endpoint
router.post('/expert-validation', async (req, res) => {
  try {
    const validationData = expertValidationSchema.parse(req.body);

    // Record expert validation in audit trail
    const result = await auditTrailService.recordExpertValidation(
      validationData.expertId,
      validationData.valuationId,
      {
        status: validationData.status,
        comments: validationData.comments,
        adjustments: validationData.adjustments
      },
      {
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        sessionId: req.sessionID || 'unknown'
      }
    );

    // Update performance metrics if validation is complete
    if (validationData.status === "approved" || validationData.status === "rejected") {
      await performanceTrackingService.validatePrediction(
        "hybrid_valuation",
        validationData.valuationId,
        validationData.adjustments?.actualValue as number || 0
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Expert validation error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to record expert validation'
    });
  }
});

// Track model performance
router.post('/track-prediction', async (req, res) => {
  try {
    const { modelName, prediction } = req.body;
    await performanceTrackingService.trackPrediction(modelName, prediction);
    res.json({ success: true });
  } catch (error) {
    console.error('Prediction tracking error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to track prediction'
    });
  }
});

// Get audit trail with compliance information
router.get('/audit-trail/:valuationId', async (req, res) => {
  try {
    const { valuationId } = req.params;
    const { startDate, endDate, eventTypes, validationStatus } = req.query;

    const filters = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      eventTypes: eventTypes ? (eventTypes as string).split(',') : undefined,
      validationStatus: validationStatus as any
    };

    const auditTrail = await auditTrailService.getAuditTrail(valuationId, filters);
    res.json(auditTrail);
  } catch (error) {
    console.error('Audit trail error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get audit trail'
    });
  }
});

// Get compliance status
router.get('/compliance/:valuationId', async (req, res) => {
  try {
    const { valuationId } = req.params;
    const valuation = await db.query.valuationRecords.findFirst({
      where: eq(valuationRecords.id, valuationId)
    });

    if (!valuation) {
      return res.status(404).json({ error: 'Valuation not found' });
    }

    const compliance = await validationService.performComplianceCheck(
      valuationId,
      valuation
    );

    res.json(compliance);
  } catch (error) {
    console.error('Compliance check error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to check compliance'
    });
  }
});

export default router;