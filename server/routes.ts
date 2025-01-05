import type { Express } from "express";
import { createServer, type Server } from "http";
import { calculateValuation } from "./lib/valuation";
import { generatePdfReport } from "./lib/report";
import { assessStartupRisk } from "./lib/riskAssessment";
import { predictStartupPotential } from "./lib/potentialPredictor";
import { generateEcosystemNetwork } from "./lib/ecosystemNetwork";
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
      const [valuationResult, riskAssessment, potentialPrediction, ecosystemNetwork] = await Promise.all([
        calculateValuation({
          revenue,
          growthRate,
          margins,
          industry,
          stage,
        }),
        assessStartupRisk({
          revenue,
          growthRate,
          margins,
          industry,
          stage,
        }),
        predictStartupPotential({
          revenue,
          growthRate,
          margins,
          industry,
          stage,
        }),
        generateEcosystemNetwork({
          industry,
          stage,
        }),
      ]);

      const result = {
        ...valuationResult,
        riskAssessment,
        potentialPrediction,
        ecosystemNetwork,
      };

      // Cache the result
      cache.set(cacheKey, result);

      res.json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.post("/api/report", async (req, res) => {
    try {
      const data = req.body;
      const pdfBuffer = await generatePdfReport(data);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="valuation-report.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}