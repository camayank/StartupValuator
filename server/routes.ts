import type { Express } from "express";
import { createServer, type Server } from "http";
import { calculateValuation } from "./lib/valuation";
import { generatePdfReport } from "./lib/report";
import { assessStartupRisk } from "./lib/riskAssessment";
import { predictStartupPotential } from "./lib/potentialPredictor";
import { generateEcosystemNetwork } from "./lib/ecosystemNetwork";
import { analyzePitchDeck } from "./lib/pitchDeckAnalyzer";
import { setupCache } from "./lib/cache";
import { generateChatResponse } from "./lib/chatbot";
import { db } from "@db";
import { founderProfiles, users } from "@db/schema";
import { eq } from "drizzle-orm";
import { valuationFormSchema } from "../client/src/lib/validations";
import { calculateFinancialAssumptions, validateRegionCompliance } from "./lib/financialAssumptions";
import XLSX from "xlsx";
import { Parser } from "json2csv";
import pdfMake from "pdfmake";
import { ZodError } from "zod";

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

      // Calculate financial assumptions with regional compliance
      const assumptions = calculateFinancialAssumptions(validatedData);
      const compliance = validateRegionCompliance(assumptions, validatedData);

      // Apply any necessary compliance adjustments
      const finalAssumptions = compliance.isCompliant
        ? assumptions
        : { ...assumptions, ...compliance.adjustments };

      // Calculate base valuation using adjusted assumptions
      const valuationResult = await calculateValuation({
        ...validatedData,
        assumptions: finalAssumptions,
      });

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
        assumptions: finalAssumptions,
        compliance: {
          isCompliant: compliance.isCompliant,
          reasons: compliance.reasons,
        },
        ...(riskAssessment && { riskAssessment }),
        ...(potentialPrediction && { potentialPrediction }),
        ...(ecosystemNetwork && { ecosystemNetwork }),
      };

      cache.set(cacheKey, result);
      res.json(result);
    } catch (error) {
      console.error('Valuation calculation failed:', error);

      // Enhanced error handling with type checking
      if (error instanceof ZodError) {
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

  // Chatbot endpoint for financial advice
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          message: 'Invalid request. Message is required and must be a string.',
        });
      }

      const response = await generateChatResponse(message, context);
      res.json(response);
    } catch (error) {
      console.error('Chat generation failed:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to generate chat response'
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

  // Export routes for different formats
  app.post("/api/export/pdf", async (req, res) => {
    try {
      const data = req.body;
      const pdfBuffer = await generatePdfReport(data);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="valuation-report.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF export failed:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to generate PDF"
      });
    }
  });

  app.post("/api/export/xlsx", async (req, res) => {
    try {
      const data = req.body;

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();

      // Convert data to worksheet format
      const ws = XLSX.utils.json_to_sheet([{
        "Business Name": data.businessName,
        "Industry": data.industry,
        "Stage": data.stage,
        "Revenue": data.revenue,
        "Growth Rate": `${data.growthRate}%`,
        "Valuation": data.valuation,
      }]);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Valuation Summary");

      // Generate buffer
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="valuation-report.xlsx"');
      res.send(buffer);
    } catch (error) {
      console.error("Excel export failed:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to generate Excel file"
      });
    }
  });

  app.post("/api/export/csv", async (req, res) => {
    try {
      const data = req.body;

      // Prepare data for CSV
      const fields = ["businessName", "industry", "stage", "revenue", "growthRate", "valuation"];
      const parser = new Parser({ fields });
      const csv = parser.parse(data);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="valuation-report.csv"');
      res.send(csv);
    } catch (error) {
      console.error("CSV export failed:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to generate CSV file"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}