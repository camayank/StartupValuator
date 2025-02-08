import { Router } from 'express';
import { enhancedAIService } from '../services/enhanced-ai-service';
import { performanceTrackingService } from '../services/performance-tracking-service';
import { z } from 'zod';

const router = Router();

// Validation schemas
const validationRequestSchema = z.object({
  valuationId: z.string(),
  actualValue: z.number(),
  modelName: z.string(),
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

export default router;
