import type { Express } from "express";
import { createServer, type Server } from "http";
import { calculateValuation } from "./lib/valuation";
import { generatePdfReport } from "./lib/report";
import { assessStartupRisk } from "./lib/riskAssessment";
import { predictStartupPotential } from "./lib/potentialPredictor";
import { generateEcosystemNetwork } from "./lib/ecosystemNetwork";
import { setupCache } from "./lib/cache";
import { db } from "@db";
import { founderProfiles, users } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  const cache = setupCache();

  // Existing valuation route
  app.post("/api/valuation", async (req, res) => {
    const { revenue, growthRate, margins, industry, stage } = req.body;
    const cacheKey = `${revenue}-${growthRate}-${margins}-${industry}-${stage}`;
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

      cache.set(cacheKey, result);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Existing report route
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

  // New founder profile routes
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await db.query.founderProfiles.findFirst({
        where: eq(founderProfiles.userId, parseInt(userId)),
        with: {
          user: true,
        },
      });

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const profileData = req.body;
      const result = await db.insert(founderProfiles).values(profileData).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.patch("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      const result = await db
        .update(founderProfiles)
        .set(updateData)
        .where(eq(founderProfiles.userId, parseInt(userId)))
        .returning();

      if (!result.length) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}