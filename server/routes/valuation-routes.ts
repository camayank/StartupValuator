import { Router } from 'express';
import { calculateValuation } from '../lib/valuation';
import { blockchainService } from '../services/blockchain-service';
import { patternRecognitionService } from '../services/pattern-recognition-service';
import { marketDataService } from '../services/market-data-service';
import { regulatoryComplianceService } from '../services/regulatory-compliance-service';
import { monteCarloService } from '../services/monte-carlo-service';
import { z } from 'zod';

const router = Router();

// Enhanced validation schema for valuation request
const valuationRequestSchema = z.object({
  businessInfo: z.object({
    id: z.string().optional(),
    name: z.string(),
    sector: z.string(),
    industry: z.string(),
    location: z.string(),
    productStage: z.enum([
      'concept',
      'prototype',
      'mvp',
      'beta',
      'market_ready',
      'scaling',
      'mature'
    ]),
    businessModel: z.enum([
      'subscription',
      'marketplace',
      'saas',
      'ecommerce',
      'advertising',
      'hardware',
      'freemium'
    ]),
    financials: z.object({
      revenue: z.number(),
      margins: z.number().optional(),
      growthRate: z.number().optional(),
      currency: z.string().default('USD'),
    }).optional(),
  }),
  marketInfo: z.object({
    targetMarket: z.string(),
    competitors: z.array(z.string()),
    marketSize: z.number().optional(),
    marketGrowth: z.number().optional(),
  }),
  teamInfo: z.object({
    size: z.number(),
    experience: z.string(),
    expertise: z.array(z.string()),
  }),
  productInfo: z.object({
    description: z.string(),
    stage: z.string(),
    traction: z.string().optional(),
  }),
  simulationParams: z.object({
    iterations: z.number().optional(),
    confidenceInterval: z.number().optional(),
    scenarios: z.array(z.string()).optional(),
  }).optional(),
});

// Calculate valuation with enhanced features
router.post('/calculate', async (req, res) => {
  try {
    const data = valuationRequestSchema.parse(req.body);
    const valuation = await calculateValuation(data);
    res.json(valuation);
  } catch (error) {
    console.error('Valuation calculation error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to calculate valuation'
    });
  }
});

// Verify valuation on blockchain
router.get('/verify/:valuationId', async (req, res) => {
  try {
    const { valuationId } = req.params;
    const verification = await blockchainService.verifyValuation(valuationId, 0);
    res.json(verification);
  } catch (error) {
    console.error('Valuation verification error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to verify valuation'
    });
  }
});

// Get valuation history
router.get('/history/:valuationId', async (req, res) => {
  try {
    const { valuationId } = req.params;
    const history = await blockchainService.getValuationHistory(valuationId);
    res.json(history);
  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to retrieve valuation history'
    });
  }
});

// Get pattern analysis
router.post('/patterns', async (req, res) => {
  try {
    const data = valuationRequestSchema.parse(req.body);
    const patterns = await patternRecognitionService.analyzePatterns(data);
    res.json(patterns);
  } catch (error) {
    console.error('Pattern analysis error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to analyze patterns'
    });
  }
});

// Calculate consensus valuation
router.get('/consensus/:valuationId', async (req, res) => {
  try {
    const { valuationId } = req.params;
    const consensus = await blockchainService.calculateConsensusValuation(valuationId);
    res.json({ consensusValue: consensus });
  } catch (error) {
    console.error('Consensus calculation error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to calculate consensus'
    });
  }
});

// Get industry metrics
router.get('/market-data/:industry', async (req, res) => {
  try {
    const { industry } = req.params;
    const metrics = await marketDataService.getIndustryMetrics(industry);
    res.json(metrics);
  } catch (error) {
    console.error('Market data error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to fetch market data'
    });
  }
});

// Get comparable companies
router.get('/comparables/:industry', async (req, res) => {
  try {
    const { industry } = req.params;
    const { minRevenue, maxRevenue } = req.query;
    const comparables = await marketDataService.getComparableCompanies(
      industry,
      [Number(minRevenue) || 0, Number(maxRevenue) || Infinity]
    );
    res.json(comparables);
  } catch (error) {
    console.error('Comparables error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to fetch comparable companies'
    });
  }
});

// Check regulatory compliance
router.post('/compliance', async (req, res) => {
  try {
    const data = valuationRequestSchema.parse(req.body);
    const { valuationAmount } = req.body;
    const compliance = await regulatoryComplianceService.checkCompliance(data, valuationAmount);
    res.json(compliance);
  } catch (error) {
    console.error('Compliance check error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to check compliance'
    });
  }
});

// Run Monte Carlo simulation
router.post('/simulate', async (req, res) => {
  try {
    const data = valuationRequestSchema.parse(req.body);
    const { baseValue, customParams } = req.body;
    const simulation = await monteCarloService.runSimulation(data, baseValue, customParams);
    res.json(simulation);
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to run simulation'
    });
  }
});

export default router;