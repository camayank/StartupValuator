/**
 * DCF Valuation Tests
 *
 * Run with: npm test or npx jest dcf-valuation.test.ts
 */

import { calculateDCFValuation, validateDCFInput } from '../dcf-valuation';
import type { ValuationInput } from '../../types/valuation-types';

describe('DCF Valuation Tests', () => {
  describe('Input Validation', () => {
    it('should reject zero revenue', () => {
      const input: ValuationInput = {
        revenue: 0,
        growthRate: 0.5,
      };

      const validation = validateDCFInput(input);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Revenue must be greater than 0 for DCF valuation');
    });

    it('should reject zero growth rate', () => {
      const input: ValuationInput = {
        revenue: 1000000,
        growthRate: 0,
      };

      const validation = validateDCFInput(input);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Growth rate must be greater than 0');
    });

    it('should reject unrealistic growth rate', () => {
      const input: ValuationInput = {
        revenue: 1000000,
        growthRate: 6, // 600% growth
      };

      const validation = validateDCFInput(input);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Growth rate seems unrealistic (>500%) - please verify');
    });

    it('should accept valid input', () => {
      const input: ValuationInput = {
        revenue: 1000000,
        growthRate: 0.8,
      };

      const validation = validateDCFInput(input);
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });

  describe('DCF Calculation', () => {
    it('should calculate DCF valuation for SaaS startup', async () => {
      const input: ValuationInput = {
        revenue: 25000000, // ₹2.5Cr
        growthRate: 1.2, // 120%
        sector: 'saas',
        stage: 'series-a',
        burnRate: 1500000,
        runway: 18,
      };

      const result = await calculateDCFValuation(input);

      expect(result).toBeDefined();
      expect(result.valuation).toBeGreaterThan(0);
      expect(result.methodology).toBe('DCF');
      expect(result.confidenceScore).toBeGreaterThan(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(100);
    });

    it('should calculate DCF valuation for Fintech startup', async () => {
      const input: ValuationInput = {
        revenue: 50000000, // ₹5Cr
        growthRate: 1.0, // 100%
        sector: 'fintech',
        stage: 'series-a',
      };

      const result = await calculateDCFValuation(input);

      expect(result).toBeDefined();
      expect(result.valuation).toBeGreaterThan(0);
      expect(result.enterpriseValue).toBeGreaterThan(0);
      expect(result.equityValue).toBeGreaterThan(0);
    });

    it('should generate 5-year projections', async () => {
      const input: ValuationInput = {
        revenue: 10000000,
        growthRate: 0.5,
        sector: 'saas',
        stage: 'seed',
      };

      const result = await calculateDCFValuation(input);

      expect(result.projections.fcf).toHaveLength(5);
      expect(result.projections.revenue).toHaveLength(5);
      expect(result.projections.discountFactors).toHaveLength(5);
      expect(result.projections.discountedFCF).toHaveLength(5);
    });

    it('should include terminal value calculation', async () => {
      const input: ValuationInput = {
        revenue: 20000000,
        growthRate: 0.8,
        sector: 'ecommerce',
        stage: 'series-a',
      };

      const result = await calculateDCFValuation(input);

      expect(result.terminalValue).toBeGreaterThan(0);
      expect(result.pvTerminalValue).toBeGreaterThan(0);
      expect(result.pvTerminalValue).toBeLessThan(result.terminalValue);
    });

    it('should provide valuation ranges', async () => {
      const input: ValuationInput = {
        revenue: 30000000,
        growthRate: 1.0,
        sector: 'fintech',
        stage: 'series-b',
      };

      const result = await calculateDCFValuation(input);

      expect(result.ranges).toBeDefined();
      expect(result.ranges.conservative).toBeLessThan(result.ranges.base);
      expect(result.ranges.aggressive).toBeGreaterThan(result.ranges.base);
      expect(result.ranges.conservative).toBeCloseTo(result.ranges.base * 0.7, -5);
      expect(result.ranges.aggressive).toBeCloseTo(result.ranges.base * 1.3, -5);
    });

    it('should generate insights', async () => {
      const input: ValuationInput = {
        revenue: 15000000,
        growthRate: 1.5,
        sector: 'saas',
        stage: 'seed',
      };

      const result = await calculateDCFValuation(input);

      expect(result.insights).toBeDefined();
      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('should apply stage-based adjustments', async () => {
      const seedInput: ValuationInput = {
        revenue: 10000000,
        growthRate: 0.8,
        sector: 'saas',
        stage: 'seed',
      };

      const seriesBInput: ValuationInput = {
        revenue: 10000000,
        growthRate: 0.8,
        sector: 'saas',
        stage: 'series-b',
      };

      const seedResult = await calculateDCFValuation(seedInput);
      const seriesBResult = await calculateDCFValuation(seriesBInput);

      // Series B should have higher valuation due to lower risk
      expect(seriesBResult.valuation).toBeGreaterThan(seedResult.valuation);
      expect(seriesBResult.confidenceScore).toBeGreaterThan(seedResult.confidenceScore);
    });

    it('should handle different sectors correctly', async () => {
      const saasInput: ValuationInput = {
        revenue: 20000000,
        growthRate: 0.8,
        sector: 'saas',
        stage: 'series-a',
      };

      const ecommerceInput: ValuationInput = {
        revenue: 20000000,
        growthRate: 0.8,
        sector: 'ecommerce',
        stage: 'series-a',
      };

      const saasResult = await calculateDCFValuation(saasInput);
      const ecommerceResult = await calculateDCFValuation(ecommerceInput);

      // SaaS typically has higher margins and should have different WACC
      expect(saasResult.assumptions.wacc).not.toBe(ecommerceResult.assumptions.wacc);
      expect(saasResult.assumptions.grossMargin).toBeGreaterThan(
        ecommerceResult.assumptions.grossMargin
      );
    });

    it('should include assumptions in output', async () => {
      const input: ValuationInput = {
        revenue: 25000000,
        growthRate: 1.0,
        sector: 'fintech',
        stage: 'series-a',
      };

      const result = await calculateDCFValuation(input);

      expect(result.assumptions).toBeDefined();
      expect(result.assumptions.wacc).toBeGreaterThan(0);
      expect(result.assumptions.terminalGrowthRate).toBeGreaterThan(0);
      expect(result.assumptions.projectionYears).toBe(5);
      expect(result.assumptions.taxRate).toBe(0.25);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high growth rates', async () => {
      const input: ValuationInput = {
        revenue: 5000000,
        growthRate: 3.0, // 300% (high but not unrealistic for early startups)
        sector: 'saas',
        stage: 'seed',
      };

      const result = await calculateDCFValuation(input);

      expect(result.valuation).toBeGreaterThan(0);
      expect(result.confidenceScore).toBeLessThan(80); // Should have lower confidence
    });

    it('should handle low revenue startups', async () => {
      const input: ValuationInput = {
        revenue: 1000000, // ₹10L
        growthRate: 1.5,
        sector: 'saas',
        stage: 'seed',
      };

      const result = await calculateDCFValuation(input);

      expect(result.valuation).toBeGreaterThan(0);
      expect(result.confidenceScore).toBeLessThan(75); // Lower confidence for low revenue
    });

    it('should handle high burn rate scenario', async () => {
      const input: ValuationInput = {
        revenue: 10000000,
        growthRate: 0.8,
        sector: 'saas',
        stage: 'seed',
        burnRate: 2000000, // ₹20L/month
        runway: 6,
      };

      const result = await calculateDCFValuation(input);

      expect(result.valuation).toBeGreaterThan(0);
      expect(result.insights.some(i => i.includes('runway'))).toBe(true);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should value a typical Indian SaaS Series A startup', async () => {
      const input: ValuationInput = {
        companyName: 'Example SaaS Inc',
        revenue: 30000000, // ₹3Cr ARR
        growthRate: 1.5, // 150% YoY
        sector: 'saas',
        stage: 'series-a',
        burnRate: 2500000, // ₹25L/month
        runway: 18,
        location: 'Bangalore',
      };

      const result = await calculateDCFValuation(input);

      expect(result.valuation).toBeGreaterThan(100000000); // At least ₹10Cr
      expect(result.valuation).toBeLessThan(1000000000); // Less than ₹100Cr (sanity check)
      expect(result.confidenceScore).toBeGreaterThan(60);
    });

    it('should value an e-commerce company differently from SaaS', async () => {
      const input: ValuationInput = {
        revenue: 100000000, // ₹10Cr
        growthRate: 0.8, // 80%
        sector: 'ecommerce',
        stage: 'series-a',
        burnRate: 5000000,
        runway: 12,
      };

      const result = await calculateDCFValuation(input);

      // E-commerce typically has lower margins
      expect(result.assumptions.grossMargin).toBeLessThan(0.5);
      expect(result.assumptions.wacc).toBeGreaterThan(0.18); // Higher risk
    });
  });
});
