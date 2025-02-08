import { Router } from 'express';
import { enhancedAIService } from '../services/enhanced-ai-service';
import { performanceTrackingService } from '../services/performance-tracking-service';
import { auditTrailService } from '../services/audit-trail-service';
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
    res.json(analysis);
  } catch (error) {
    console.error('Market analysis error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to analyze market'
    });
  }
});

// Get AI-enhanced risk assessment
router.post('/risk-assessment', async (req, res) => {
  try {
    const assessment = await enhancedAIService.assessRisks(req.body);
    res.json(assessment);
  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to assess risks'
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
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || 'unknown',
        sessionId: req.sessionID || 'unknown'
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Expert validation error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to record expert validation'
    });
  }
});

// Track prediction performance
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

// Validate prediction against actual value
router.post('/validate-prediction', async (req, res) => {
  try {
    const data = validationRequestSchema.parse(req.body);
    const result = await performanceTrackingService.validatePrediction(
      data.modelName,
      data.valuationId,
      data.actualValue
    );
    res.json(result);
  } catch (error) {
    console.error('Prediction validation error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to validate prediction'
    });
  }
});

// Get model performance metrics
router.get('/performance/:modelName', async (req, res) => {
  try {
    const { modelName } = req.params;
    const metrics = await performanceTrackingService.getPerformanceMetrics(modelName);
    res.json(metrics);
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to get performance metrics'
    });
  }
});

// Get audit trail
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

export default router;