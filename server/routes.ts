import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { auditTrail, userActivities, workspaces } from "@db/schema";
import { valuationFormSchema } from "../client/src/lib/validations";
import { calculateValuation } from "./lib/valuation";
import { setupCache } from "./lib/cache";
import pitchDeckRouter from "./routes/pitch-deck";
import { z } from "zod";
//import rateLimit from 'express-rate-limit'; //Removed as per edited code
import { setupAuth } from "./auth";

// Initialize cache
const cache = setupCache();

// Define schemas for API requests
const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  settings: z.object({
    defaultCurrency: z.string(),
    complianceFramework: z.string(),
    region: z.string(),
    customBranding: z.object({
      logo: z.string().optional(),
      colors: z.record(z.string()).optional(),
    }).optional(),
  }),
});


export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Mount pitch deck routes
  app.use("/api/pitch-decks", pitchDeckRouter); // Assuming /api prefix for consistency

  // Valuation calculation endpoint
  app.post("/api/valuation", async (req, res, next) => {
    try {
      const validatedData = valuationFormSchema.parse(req.body);
      const cacheKey = `${JSON.stringify(validatedData)}`;

      // Check cache first
      const cachedResult = cache.get(cacheKey);
      if (cachedResult) {
        return res.json(cachedResult);
      }

      const result = await calculateValuation(validatedData);

      // Cache the result with 15-minute expiration
      cache.set(cacheKey, result, 900);

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Method recommendation endpoint
  app.post("/api/valuation/recommend-methods", async (req, res) => {
    const { stage, sector, subsector } = req.body;

    try {
      const stageConfig = businessStages[stage]; //businessStages is undefined, needs to be defined elsewhere.
      const sectorConfig = sectors[sector].subsectors[subsector]; //sectors is undefined, needs to be defined elsewhere.

      res.json({
        recommendedMethods: stageConfig.valuation.methods,
        weights: stageConfig.valuation.weights,
        requiredInputs: {
          stage: stageConfig.valuation.requiredInputs,
          sector: sectorConfig.requiredInputs[stage] || []
        }
      });
    } catch (error) {
      res.status(400).json({
        error: "Invalid stage or sector combination"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Placeholder for missing businessStages and sectors objects.  These need to be defined elsewhere in the application.
const businessStages = {};
const sectors = {};

// Removed: apiLimiter, /api/pricing/:region, /api/health, /api/workspaces, and related code.  These were removed in the edited snippet.