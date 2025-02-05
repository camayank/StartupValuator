import { Router } from 'express';
import { aiAnalysisService } from '../services/ai-analysis-service';
import type { ValuationFormData } from '../../client/src/lib/validations';

const router = Router();

// Market Analysis endpoint
router.post('/api/analysis/market', async (req, res) => {
  try {
    const data: ValuationFormData = req.body;
    const analysis = await aiAnalysisService.analyzeMarket(data);
    res.json(analysis);
  } catch (error: any) {
    console.error('Market analysis failed:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to analyze market'
    });
  }
});

// Risk Assessment endpoint
router.post('/api/analysis/risks', async (req, res) => {
  try {
    const data: ValuationFormData = req.body;
    const assessment = await aiAnalysisService.assessRisks(data);
    res.json(assessment);
  } catch (error: any) {
    console.error('Risk assessment failed:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to assess risks'
    });
  }
});

// Growth Projections endpoint
router.post('/api/analysis/growth', async (req, res) => {
  try {
    const data: ValuationFormData = req.body;
    const projections = await aiAnalysisService.generateGrowthProjections(data);
    res.json(projections);
  } catch (error: any) {
    console.error('Growth projections failed:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to generate growth projections'
    });
  }
});

// Team Analysis endpoint
router.post('/api/analysis/team', async (req, res) => {
  try {
    const data: ValuationFormData = req.body;
    const analysis = await aiAnalysisService.analyzeTeam(data);
    res.json(analysis);
  } catch (error: any) {
    console.error('Team analysis failed:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to analyze team'
    });
  }
});

// IP Assessment endpoint
router.post('/api/analysis/ip', async (req, res) => {
  try {
    const data: ValuationFormData = req.body;
    const assessment = await aiAnalysisService.assessIP(data);
    res.json(assessment);
  } catch (error: any) {
    console.error('IP assessment failed:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to assess IP'
    });
  }
});

// Comprehensive Analysis endpoint
router.post('/api/analysis/comprehensive', async (req, res) => {
  try {
    const data: ValuationFormData = req.body;
    
    // Run all analyses in parallel for better performance
    const [
      marketAnalysis,
      riskAssessment,
      growthProjections,
      teamAnalysis,
      ipAssessment
    ] = await Promise.all([
      aiAnalysisService.analyzeMarket(data),
      aiAnalysisService.assessRisks(data),
      aiAnalysisService.generateGrowthProjections(data),
      aiAnalysisService.analyzeTeam(data),
      aiAnalysisService.assessIP(data)
    ]);

    res.json({
      marketAnalysis,
      riskAssessment,
      growthProjections,
      teamAnalysis,
      ipAssessment,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Comprehensive analysis failed:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to perform comprehensive analysis'
    });
  }
});

export default router;
