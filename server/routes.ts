import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { valuationFormSchema } from "../client/src/lib/validations";
import { setupCache } from "./lib/cache";

// Initialize cache
const cache = setupCache();

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Valuation calculation endpoint
  app.post("/api/valuation", async (req, res, next) => {
    try {
      const validatedData = valuationFormSchema.parse(req.body);
      const cacheKey = `valuation:${JSON.stringify(validatedData)}`;

      // Check cache first
      const cachedResult = cache.get(cacheKey);
      if (cachedResult) {
        return res.json(cachedResult);
      }

      // Calculate base valuation based on stage and metrics
      const stage = validatedData.stage;
      const sector = validatedData.sector;

      // Get stage-specific risk premium
      const stageRiskPremium = businessStages[stage].riskPremium;

      // Get region-specific market risk premium
      const region = regions[validatedData.region];
      const marketRiskPremium = region.marketRiskPremium;

      // Calculate weighted average cost of capital (WACC)
      const wacc = region.riskFreeRate + marketRiskPremium + stageRiskPremium;

      // Get sector-specific metrics
      const sectorData = sectors[sector].subsectors[validatedData.subsector];
      const benchmarks = sectorData.benchmarks;

      // Calculate revenue multiple based on stage
      const revenueMultiple = benchmarks.revenueMultiple[stage] || 1;

      // Calculate base valuation
      let baseValuation = validatedData.revenue * revenueMultiple;

      // Apply adjustments based on qualitative factors
      const adjustments = {
        teamExperience: (validatedData.teamExperience / 10) * 0.1,
        intellectualProperty: {
          none: 0,
          pending: 0.05,
          registered: 0.1,
          multiple: 0.15
        }[validatedData.intellectualProperty],
        competitiveDifferentiation: {
          low: -0.1,
          medium: 0,
          high: 0.1
        }[validatedData.competitiveDifferentiation],
        scalability: {
          limited: -0.1,
          moderate: 0,
          high: 0.1
        }[validatedData.scalability]
      };

      // Apply adjustments to base valuation
      const totalAdjustment = Object.values(adjustments).reduce((sum, adj) => sum + adj, 0);
      const adjustedValuation = baseValuation * (1 + totalAdjustment);

      // Prepare final result
      const result = {
        valuation: adjustedValuation,
        details: {
          baseValuation,
          adjustments,
          methodResults: [
            {
              method: "Revenue Multiple",
              value: baseValuation,
              weight: 1,
              description: `Based on industry multiple of ${revenueMultiple}x revenue`
            }
          ],
          metrics: {
            wacc,
            revenueMultiple,
            riskPremium: stageRiskPremium
          }
        },
        timestamp: new Date().toISOString()
      };

      // Cache the result with 15-minute expiration
      cache.set(cacheKey, result, 900);

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Placeholder data -  replace with your actual data structures
const businessStages = {
  Seed: { riskPremium: 0.15 },
  SeriesA: { riskPremium: 0.12 },
  SeriesB: { riskPremium: 0.1 },
  SeriesC: { riskPremium: 0.08 }
};

const regions = {
  USA: { riskFreeRate: 0.02, marketRiskPremium: 0.06 },
  EU: { riskFreeRate: 0.01, marketRiskPremium: 0.05 }
};

const sectors = {
  Software: {
    subsectors: {
      SaaS: { benchmarks: { revenueMultiple: { Seed: 5, SeriesA: 7, SeriesB: 10, SeriesC: 15 } } }
    }
  }
};