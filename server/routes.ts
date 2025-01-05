import type { Express } from "express";
import { createServer, type Server } from "http";
import { calculateValuation } from "./lib/valuation";
import { setupCache } from "./lib/cache";

export function registerRoutes(app: Express): Server {
  const cache = setupCache();

  app.post("/api/valuation", async (req, res) => {
    const { revenue, growthRate, margins, industry, stage } = req.body;

    // Generate cache key
    const cacheKey = `${revenue}-${growthRate}-${margins}-${industry}-${stage}`;
    
    // Check cache
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    try {
      const result = calculateValuation({
        revenue,
        growthRate,
        margins,
        industry,
        stage,
      });

      // Cache the result
      cache.set(cacheKey, result);
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
