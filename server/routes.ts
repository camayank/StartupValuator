import type { Express } from "express";
import { createServer, type Server } from "http";
import { calculateValuation } from "./lib/valuation";
import { generatePdfReport } from "./lib/report";
import { assessStartupRisk } from "./lib/riskAssessment";
import { predictStartupPotential } from "./lib/potentialPredictor";
import { generateEcosystemNetwork } from "./lib/ecosystemNetwork";
import { analyzePitchDeck } from "./lib/pitchDeckAnalyzer";
import { setupCache } from "./lib/cache";
import { db } from "@db";
import { founderProfiles, users } from "@db/schema";
import { eq } from "drizzle-orm";
import { valuationFormSchema } from "../client/src/lib/validations";

export function registerRoutes(app: Express): Server {
  const cache = setupCache();

  // Enhanced valuation route with proper validation
  app.post("/api/valuation", async (req, res) => {
    try {
      // Validate request body against our schema
      const validatedData = valuationFormSchema.parse(req.body);

      const { revenue, growthRate, margins, industry, stage, currency, ...qualitativeFactors } = validatedData;
      const cacheKey = `${revenue}-${growthRate}-${margins}-${industry}-${stage}-${currency}`;

      const cachedResult = cache.get(cacheKey);
      if (cachedResult) {
        return res.json(cachedResult);
      }

      // Calculate base valuation first
      const valuationResult = await calculateValuation(validatedData);

      // Try to enhance with AI features, but continue if they fail
      let riskAssessment = null;
      let potentialPrediction = null;
      let ecosystemNetwork = null;

      try {
        [riskAssessment, potentialPrediction, ecosystemNetwork] = await Promise.allSettled([
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
        ]).then(results => results.map(result => 
          result.status === 'fulfilled' ? result.value : null
        ));
      } catch (error) {
        console.error('AI enhancement features failed:', error);
        // Continue without AI enhancements
      }

      const result = {
        ...valuationResult,
        ...(riskAssessment && { riskAssessment }),
        ...(potentialPrediction && { potentialPrediction }),
        ...(ecosystemNetwork && { ecosystemNetwork }),
      };

      cache.set(cacheKey, result);
      res.json(result);
    } catch (error) {
      console.error('Valuation calculation failed:', error);

      // Enhanced error handling
      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors,
        });
      }

      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to calculate valuation'
      });
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

  // Add new pitch deck analysis route
  app.post("/api/analyze-pitch-deck", async (req, res) => {
    try {
      const { slides } = req.body;

      if (!Array.isArray(slides) || slides.length === 0) {
        return res.status(400).json({ message: "Invalid slides data" });
      }

      const analysis = await analyzePitchDeck(slides);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}