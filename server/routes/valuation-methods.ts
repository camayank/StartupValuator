/**
 * API Routes for Individual Valuation Methods
 */

import { Router, type Request, Response } from 'express';
import { calculateDCFValuation, validateDCFInput } from '../services/valuation-methods/dcf-valuation';
import { calculateBerkusValuation, validateBerkusInput } from '../services/valuation-methods/berkus-method';
import type { ValuationInput } from '../services/types/valuation-types';

const router = Router();

/**
 * POST /api/valuation/dcf
 * Calculate valuation using DCF method
 */
router.post('/dcf', async (req: Request, res: Response) => {
  try {
    const input: ValuationInput = req.body;

    // Validate input
    const validation = validateDCFInput(input);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid input for DCF valuation',
        details: validation.errors,
      });
    }

    // Calculate DCF valuation
    const result = await calculateDCFValuation(input);

    return res.json({
      success: true,
      method: 'DCF',
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('DCF valuation error:', error);
    return res.status(500).json({
      error: 'Failed to calculate DCF valuation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/valuation/berkus
 * Calculate valuation using Berkus method for pre-revenue startups
 */
router.post('/berkus', async (req: Request, res: Response) => {
  try {
    const input: ValuationInput = req.body;

    // Validate input
    const validation = validateBerkusInput(input);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid input for Berkus valuation',
        details: validation.errors,
      });
    }

    // Calculate Berkus valuation
    const result = await calculateBerkusValuation(input);

    return res.json({
      success: true,
      method: 'Berkus',
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Berkus valuation error:', error);
    return res.status(500).json({
      error: 'Failed to calculate Berkus valuation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/valuation/scorecard
 * Calculate valuation using Scorecard method (placeholder for next implementation)
 */
router.post('/scorecard', async (req: Request, res: Response) => {
  return res.status(501).json({
    error: 'Scorecard method not yet implemented',
    message: 'This endpoint will be available in the next phase',
  });
});

/**
 * POST /api/valuation/vc-method
 * Calculate valuation using VC method (placeholder for next implementation)
 */
router.post('/vc-method', async (req: Request, res: Response) => {
  return res.status(501).json({
    error: 'VC method not yet implemented',
    message: 'This endpoint will be available in the next phase',
  });
});

/**
 * POST /api/valuation/hybrid
 * Calculate valuation using multiple methods (placeholder for future implementation)
 */
router.post('/hybrid', async (req: Request, res: Response) => {
  return res.status(501).json({
    error: 'Hybrid valuation not yet implemented',
    message: 'This endpoint will combine all methods and will be available after all individual methods are complete',
  });
});

export default router;
