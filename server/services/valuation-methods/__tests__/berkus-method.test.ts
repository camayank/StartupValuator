/**
 * Berkus Method Valuation Tests
 */

import { calculateBerkusValuation, validateBerkusInput } from '../berkus-method';
import type { ValuationInput } from '../../types/valuation-types';

describe('Berkus Method Tests', () => {
  describe('Input Validation', () => {
    it('should accept pre-revenue startup', () => {
      const input: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'MVP',
        foundersCount: 2,
      };

      const validation = validateBerkusInput(input);
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should warn for high-revenue companies', () => {
      const input: ValuationInput = {
        revenue: 60000000, // ₹6Cr - too high for Berkus
        growthRate: 0.5,
      };

      const validation = validateBerkusInput(input);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('DCF or Scorecard'))).toBe(true);
    });

    it('should require basic information', () => {
      const input: ValuationInput = {
        revenue: 0,
        growthRate: 0,
      };

      const validation = validateBerkusInput(input);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('product stage'))).toBe(true);
    });

    it('should accept early revenue companies', () => {
      const input: ValuationInput = {
        revenue: 1000000, // ₹10L - early revenue
        growthRate: 0.8,
        productStage: 'Launched',
        foundersCount: 2,
      };

      const validation = validateBerkusInput(input);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Berkus Calculation', () => {
    it('should value idea-stage startup', async () => {
      const input: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'Idea',
        foundersCount: 2,
        stage: 'pre-seed',
        sector: 'saas',
        marketSize: 500000000, // ₹50Cr market
      };

      const result = await calculateBerkusValuation(input);

      expect(result).toBeDefined();
      expect(result.valuation).toBeGreaterThan(0);
      expect(result.methodology).toBe('Berkus');
      expect(result.breakdown).toBeDefined();
    });

    it('should value MVP-stage startup higher than idea', async () => {
      const ideaInput: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'Idea',
        foundersCount: 2,
        stage: 'seed',
        sector: 'saas',
      };

      const mvpInput: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'MVP',
        foundersCount: 2,
        stage: 'seed',
        sector: 'saas',
      };

      const ideaResult = await calculateBerkusValuation(ideaInput);
      const mvpResult = await calculateBerkusValuation(mvpInput);

      expect(mvpResult.valuation).toBeGreaterThan(ideaResult.valuation);
      expect(mvpResult.breakdown.prototype).toBeGreaterThan(ideaResult.breakdown.prototype);
    });

    it('should value launched product highest', async () => {
      const input: ValuationInput = {
        revenue: 500000, // ₹5L early revenue
        growthRate: 0,
        productStage: 'Launched',
        foundersCount: 3,
        employeeCount: 8,
        customerCount: 25,
        stage: 'seed',
        sector: 'saas',
      };

      const result = await calculateBerkusValuation(input);

      expect(result.valuation).toBeGreaterThan(5000000); // At least ₹50L
      expect(result.breakdown.productRollout).toBeGreaterThan(0);
      expect(result.breakdown.prototype).toBeGreaterThan(0);
    });

    it('should provide breakdown of all five factors', async () => {
      const input: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'Beta',
        foundersCount: 2,
        employeeCount: 5,
        customerCount: 15,
        stage: 'seed',
        sector: 'fintech',
        marketSize: 1000000000,
        isDPIITRegistered: true,
        hasKeyHires: true,
      };

      const result = await calculateBerkusValuation(input);

      expect(result.breakdown.soundIdea).toBeGreaterThan(0);
      expect(result.breakdown.prototype).toBeGreaterThan(0);
      expect(result.breakdown.qualityManagement).toBeGreaterThan(0);
      expect(result.breakdown.strategicRelationships).toBeGreaterThan(0);
      expect(result.breakdown.productRollout).toBeGreaterThanOrEqual(0);
    });

    it('should respect maximum values per stage', async () => {
      const input: ValuationInput = {
        revenue: 5000000, // ₹50L
        growthRate: 1.0,
        productStage: 'Launched',
        foundersCount: 3,
        employeeCount: 20,
        customerCount: 100,
        stage: 'pre-seed',
        sector: 'saas',
        marketSize: 5000000000,
        isDPIITRegistered: true,
        hasKeyHires: true,
        hasTraction: true,
        hasProductMarketFit: true,
        hasPatents: true,
      };

      const result = await calculateBerkusValuation(input);

      // Should not exceed max for pre-seed (₹1.5Cr base * 1.2 SaaS multiplier = ₹1.8Cr)
      expect(result.valuation).toBeLessThanOrEqual(20000000);
    });

    it('should apply sector multipliers correctly', async () => {
      const saasInput: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'MVP',
        foundersCount: 2,
        stage: 'seed',
        sector: 'saas',
      };

      const ecommerceInput: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'MVP',
        foundersCount: 2,
        stage: 'seed',
        sector: 'ecommerce',
      };

      const saasResult = await calculateBerkusValuation(saasInput);
      const ecommerceResult = await calculateBerkusValuation(ecommerceInput);

      // SaaS should have higher valuation (1.2x multiplier)
      expect(saasResult.valuation).toBeGreaterThan(ecommerceResult.valuation);
    });

    it('should apply location multipliers', async () => {
      const bangaloreInput: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'MVP',
        foundersCount: 2,
        stage: 'seed',
        sector: 'saas',
        location: 'Bangalore',
      };

      const tier2Input: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'MVP',
        foundersCount: 2,
        stage: 'seed',
        sector: 'saas',
        location: 'Jaipur',
      };

      const bangaloreResult = await calculateBerkusValuation(bangaloreInput);
      const tier2Result = await calculateBerkusValuation(tier2Input);

      // Bangalore should have higher valuation (1.15x multiplier)
      expect(bangaloreResult.valuation).toBeGreaterThan(tier2Result.valuation);
    });

    it('should generate actionable insights', async () => {
      const input: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'Idea',
        foundersCount: 1,
        stage: 'pre-seed',
        sector: 'saas',
      };

      const result = await calculateBerkusValuation(input);

      expect(result.insights).toBeDefined();
      expect(result.insights.length).toBeGreaterThan(0);
      expect(result.insights.some(i => i.includes('MVP') || i.includes('prototype'))).toBe(true);
    });

    it('should provide valuation ranges', async () => {
      const input: ValuationInput = {
        revenue: 1000000,
        growthRate: 0,
        productStage: 'Beta',
        foundersCount: 2,
        employeeCount: 5,
        customerCount: 20,
        stage: 'seed',
        sector: 'fintech',
      };

      const result = await calculateBerkusValuation(input);

      expect(result.ranges).toBeDefined();
      expect(result.ranges.conservative).toBeLessThan(result.ranges.base);
      expect(result.ranges.aggressive).toBeGreaterThan(result.ranges.base);
      expect(result.ranges.conservative).toBeCloseTo(result.ranges.base * 0.7, -5);
      expect(result.ranges.aggressive).toBeCloseTo(result.ranges.base * 1.3, -5);
    });
  });

  describe('Factor Scoring', () => {
    it('should score team quality higher with more founders', async () => {
      const singleFounder: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'MVP',
        foundersCount: 1,
        stage: 'seed',
        sector: 'saas',
      };

      const multipleFounders: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'MVP',
        foundersCount: 3,
        stage: 'seed',
        sector: 'saas',
      };

      const singleResult = await calculateBerkusValuation(singleFounder);
      const multipleResult = await calculateBerkusValuation(multipleFounders);

      expect(multipleResult.breakdown.qualityManagement).toBeGreaterThan(
        singleResult.breakdown.qualityManagement
      );
    });

    it('should score relationships higher with customers', async () => {
      const noCustomers: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'MVP',
        foundersCount: 2,
        customerCount: 0,
        stage: 'seed',
        sector: 'saas',
      };

      const withCustomers: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'MVP',
        foundersCount: 2,
        customerCount: 50,
        stage: 'seed',
        sector: 'saas',
      };

      const noCustomersResult = await calculateBerkusValuation(noCustomers);
      const withCustomersResult = await calculateBerkusValuation(withCustomers);

      expect(withCustomersResult.breakdown.strategicRelationships).toBeGreaterThan(
        noCustomersResult.breakdown.strategicRelationships
      );
    });

    it('should score product rollout higher with revenue', async () => {
      const noRevenue: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'Launched',
        foundersCount: 2,
        stage: 'seed',
        sector: 'saas',
      };

      const withRevenue: ValuationInput = {
        revenue: 2000000, // ₹20L
        growthRate: 0,
        productStage: 'Launched',
        foundersCount: 2,
        stage: 'seed',
        sector: 'saas',
      };

      const noRevenueResult = await calculateBerkusValuation(noRevenue);
      const withRevenueResult = await calculateBerkusValuation(withRevenue);

      expect(withRevenueResult.breakdown.productRollout).toBeGreaterThan(
        noRevenueResult.breakdown.productRollout
      );
    });

    it('should value DPIIT registration', async () => {
      const noDPIIT: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'MVP',
        foundersCount: 2,
        stage: 'seed',
        sector: 'saas',
        isDPIITRegistered: false,
      };

      const withDPIIT: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'MVP',
        foundersCount: 2,
        stage: 'seed',
        sector: 'saas',
        isDPIITRegistered: true,
      };

      const noDPIITResult = await calculateBerkusValuation(noDPIIT);
      const withDPIITResult = await calculateBerkusValuation(withDPIIT);

      expect(withDPIITResult.breakdown.soundIdea).toBeGreaterThan(
        noDPIITResult.breakdown.soundIdea
      );
    });
  });

  describe('Real-World Scenarios', () => {
    it('should value typical pre-seed SaaS idea', async () => {
      const input: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'Prototype',
        foundersCount: 2,
        employeeCount: 3,
        stage: 'pre-seed',
        sector: 'saas',
        location: 'Bangalore',
        marketSize: 500000000,
        isDPIITRegistered: true,
      };

      const result = await calculateBerkusValuation(input);

      expect(result.valuation).toBeGreaterThan(2000000); // At least ₹20L
      expect(result.valuation).toBeLessThan(20000000); // Less than ₹2Cr
      expect(result.confidenceScore).toBeGreaterThan(40);
      expect(result.confidenceScore).toBeLessThan(80);
    });

    it('should value seed-stage fintech with early traction', async () => {
      const input: ValuationInput = {
        revenue: 1500000, // ₹15L ARR
        growthRate: 2.0,
        productStage: 'Launched',
        foundersCount: 3,
        employeeCount: 10,
        customerCount: 50,
        stage: 'seed',
        sector: 'fintech',
        location: 'Mumbai',
        marketSize: 2000000000,
        isDPIITRegistered: true,
        hasKeyHires: true,
        hasTraction: true,
      };

      const result = await calculateBerkusValuation(input);

      expect(result.valuation).toBeGreaterThan(15000000); // At least ₹1.5Cr
      expect(result.valuation).toBeLessThan(60000000); // Less than ₹6Cr
      expect(result.confidenceScore).toBeGreaterThan(60);
    });

    it('should value edtech startup with MVP', async () => {
      const input: ValuationInput = {
        revenue: 500000, // ₹5L early revenue
        growthRate: 1.5,
        productStage: 'MVP',
        foundersCount: 2,
        employeeCount: 6,
        customerCount: 100,
        stage: 'seed',
        sector: 'edtech',
        location: 'Bangalore',
        marketSize: 1000000000,
        hasProductMarketFit: true,
      };

      const result = await calculateBerkusValuation(input);

      expect(result.valuation).toBeGreaterThan(10000000); // At least ₹1Cr
      expect(result.breakdown.strategicRelationships).toBeGreaterThan(0); // 100 customers
    });
  });

  describe('Confidence Scoring', () => {
    it('should have higher confidence for launched products', async () => {
      const ideaInput: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'Idea',
        foundersCount: 2,
        stage: 'seed',
        sector: 'saas',
      };

      const launchedInput: ValuationInput = {
        revenue: 0,
        growthRate: 0,
        productStage: 'Launched',
        foundersCount: 2,
        stage: 'seed',
        sector: 'saas',
      };

      const ideaResult = await calculateBerkusValuation(ideaInput);
      const launchedResult = await calculateBerkusValuation(launchedInput);

      expect(launchedResult.confidenceScore).toBeGreaterThan(ideaResult.confidenceScore);
    });

    it('should have confidence score within valid range', async () => {
      const input: ValuationInput = {
        revenue: 1000000,
        growthRate: 0,
        productStage: 'Beta',
        foundersCount: 2,
        customerCount: 20,
        stage: 'seed',
        sector: 'saas',
      };

      const result = await calculateBerkusValuation(input);

      expect(result.confidenceScore).toBeGreaterThanOrEqual(40);
      expect(result.confidenceScore).toBeLessThanOrEqual(85);
    });
  });
});
