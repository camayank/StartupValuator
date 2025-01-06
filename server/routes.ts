import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { auditTrail, userActivities, workspaces } from "@db/schema";
import { valuationFormSchema } from "../client/src/lib/validations";
import { calculateValuation } from "./lib/valuation";
import { setupCache } from "./lib/cache";
import { z } from "zod";
import rateLimit from 'express-rate-limit';

// Initialize cache
const cache = setupCache();

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

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
  // Apply rate limiting to API routes
  app.use("/api/", apiLimiter);

  // Health check endpoint for load balancers
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Workspace Management Routes
  app.post("/api/workspaces", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const data = createWorkspaceSchema.parse(req.body);
      const [workspace] = await db.insert(workspaces).values({
        name: data.name,
        ownerId: req.user!.id,
        settings: data.settings,
      }).returning();

      await db.insert(auditTrail).values({
        workspaceId: workspace.id,
        userId: req.user!.id,
        action: "workspace_created",
        details: { workspace },
        valuationId: null,
      });

      res.json(workspace);
    } catch (error) {
      next(error);
    }
  });

  // Region-specific pricing route with caching
  app.get("/api/pricing/:region", async (req, res) => {
    const { region } = req.params;
    const cacheKey = `pricing_${region.toLowerCase()}`;

    try {
      // Check cache first
      const cachedPricing = cache.get(cacheKey);
      if (cachedPricing) {
        return res.json(cachedPricing);
      }

      // Get base pricing tiers
      const basePricing = {
        free: { price: 0, features: ["Basic valuation", "Single user"] },
        startup: { price: 19.99, features: ["Multiple users", "Advanced analytics"] },
        enterprise: { price: 99.99, features: ["Custom branding", "API access"] },
      };

      // Apply regional adjustments
      const regionalPricing = adjustPricingForRegion(basePricing, region);

      // Cache the result with 1-hour expiration
      cache.set(cacheKey, regionalPricing, 3600);

      res.json(regionalPricing);
    } catch (error) {
      console.error("Failed to get regional pricing:", error);
      res.status(500).json({ message: "Failed to get pricing information" });
    }
  });

  // Enhanced valuation route with comprehensive insights
  app.post("/api/valuation", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const validatedData = valuationFormSchema.parse(req.body);
      const cacheKey = `${validatedData.revenue}-${validatedData.growthRate}-${validatedData.margins}-${validatedData.industry}-${validatedData.stage}-${validatedData.region}`;

      const cachedResult = cache.get(cacheKey);
      if (cachedResult) {
        return res.json(cachedResult);
      }

      const baseValuation = await calculateValuation(validatedData);
      const result = {
        ...baseValuation,
        timestamp: new Date().toISOString(),
      };

      // Cache the result with 15-minute expiration
      cache.set(cacheKey, result, 900);

      // Track usage for billing
      await db.insert(userActivities).values({
        userId: req.user!.id,
        activityType: "valuation_completed",
        path: req.path,
        metadata: {
          industry: validatedData.industry,
          stage: validatedData.stage,
          success: true,
        },
        sessionId: req.sessionID,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper function for regional pricing adjustments
function adjustPricingForRegion(basePricing: any, region: string) {
  // PPP multipliers for different regions
  const pppMultipliers: Record<string, number> = {
    'us': 1.0,
    'uk': 0.9,
    'eu': 0.85,
    'in': 0.4,
    'br': 0.5,
    'sg': 0.8,
  };

  const multiplier = pppMultipliers[region.toLowerCase()] || 1.0;

  return Object.entries(basePricing).reduce((acc: any, [tier, details]: [string, any]) => {
    acc[tier] = {
      ...details,
      price: Math.round((details.price * multiplier) * 100) / 100, // Round to 2 decimal places
    };
    return acc;
  }, {});
}

function calculateComplexity(result: any): "low" | "medium" | "high" {
  const factors = [
    result.industry === "Technology",
    result.valuation > 10000000,
    result.insights?.length > 5,
  ];

  const complexityScore = factors.filter(Boolean).length;
  return complexityScore <= 1 ? "low" : complexityScore === 2 ? "medium" : "high";
}