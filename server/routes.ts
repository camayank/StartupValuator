import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
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

      // TODO: Implement actual valuation calculation
      const result = {
        valuation: "Coming soon",
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