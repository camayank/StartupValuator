import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { WorkflowSuggestionEngine } from "./services/workflowSuggestion";
import { ActivityTracker } from "./services/activityTracker";
import { userProfiles } from "@db/schema";
import { eq } from "drizzle-orm";
import { valuationFormSchema } from "../client/src/lib/validations";
import { generatePdfReport } from "./lib/report";
import { calculateValuation } from "./lib/valuation";
import { setupCache } from "./lib/cache";
import { z } from "zod";
import { generatePersonalizedSuggestions, analyzeIndustryFit } from "./services/ai-personalization";
import { Parser } from "json2csv";
import * as XLSX from 'xlsx';
import { setupAuth } from "./auth";
import { 
  analyzePitchDeck,
  validateMetrics,
  assessBusinessModel,
  generateComplianceReport,
  generateComplianceChecklist,
  analyzeMarketSentiment,
  assessIntellectualProperty,
  evaluateTeamExpertise,
  validateRevenueModel,
  generateValuationReport
} from "../client/src/lib/services/openai";

// Define pitch deck data schema for validation
const pitchDeckSlideSchema = z.object({
  slideNumber: z.number(),
  content: z.string(),
  type: z.string(),
});

const pitchDeckAnalysisRequestSchema = z.object({
  slides: z.array(pitchDeckSlideSchema),
});

// Define report data schema for validation
const reportDataSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  valuationPurpose: z.string(),
  revenue: z.number().min(0, "Revenue must be non-negative"),
  currency: z.string(),
  growthRate: z.number(),
  margins: z.number(),
  sector: z.string(),
  industry: z.string(),
  stage: z.string(),
  region: z.string(),
  valuation: z.number().optional(),
  multiplier: z.number().optional(),
  details: z.object({
    baseValuation: z.number().optional(),
    adjustments: z.record(z.string(), z.number()).optional()
  }).optional(),
  riskAssessment: z.any().optional(),
  potentialPrediction: z.any().optional(),
  ecosystemNetwork: z.any().optional()
});

export function registerRoutes(app: Express): Server {
  // Set up authentication routes first
  setupAuth(app);

  // Rest of your routes...
  const cache = setupCache();

  // Activity tracking middleware
  app.use((req, res, next) => {
    if (req.isAuthenticated() && req.user) {
      ActivityTracker.trackActivity(req.user.id, "page_view", req).catch(console.error);
    }
    next();
  });

  // Add activity tracking endpoint
  app.post("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      await ActivityTracker.trackActivity(
        req.user!.id,
        req.body.activityType,
        req,
        req.body.metadata
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to track activity:", error);
      res.status(500).json({ message: "Failed to track activity" });
    }
  });

  // Add pitch deck analysis endpoint
  app.post("/api/analyze-pitch-deck", async (req, res) => {
    try {
      console.log('Received pitch deck analysis request:', req.body);

      // Validate request data
      const { slides } = pitchDeckAnalysisRequestSchema.parse(req.body);
      console.log('Validated slides:', slides);

      // Analyze pitch deck using OpenAI
      const analysis = await analyzePitchDeck(slides);
      console.log('Analysis completed successfully');

      res.json(analysis);
    } catch (error) {
      console.error('Pitch deck analysis failed:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Invalid pitch deck data provided',
          errors: error.errors,
        });
      }

      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to analyze pitch deck'
      });
    }
  });

  // Workflow suggestion routes
  app.get("/api/suggestions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      await WorkflowSuggestionEngine.generateSuggestions(req.user!.id);
      const suggestions = await WorkflowSuggestionEngine.getUserSuggestions(req.user!.id);
      res.json(suggestions);
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      res.status(500).json({ message: "Failed to get suggestions" });
    }
  });

  // Enhanced report generation route with better error handling
  app.post("/api/report", async (req, res) => {
    try {
      console.log('Received report generation request:', JSON.stringify(req.body, null, 2));

      // Validate request data
      const validatedData = reportDataSchema.parse(req.body);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));

      // Generate PDF report
      const pdfBuffer = await generatePdfReport(validatedData);
      console.log('PDF buffer generated successfully');

      // Set appropriate headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="startup-valuation-report.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Report generation failed:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Invalid data provided',
          errors: error.errors,
        });
      }

      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to generate report'
      });
    }
  });

  // Compliance checking routes
  app.post("/api/compliance/check", async (req, res) => {
    try {
      const report = await generateComplianceReport(req.body);
      res.json(report);
    } catch (error) {
      console.error("Compliance check failed:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to generate compliance report"
      });
    }
  });

  app.post("/api/compliance/checklist", async (req, res) => {
    try {
      const { industry, region } = req.body;
      const checklist = await generateComplianceChecklist(industry, region);
      res.json(checklist);
    } catch (error) {
      console.error("Checklist generation failed:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to generate compliance checklist"
      });
    }
  });

  // Business model and team assessment routes
  app.post("/api/business-model/assess", async (req, res) => {
    try {
      const assessment = await assessBusinessModel(req.body, req.body.industry);
      res.json(assessment);
    } catch (error) {
      console.error("Business model assessment failed:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to assess business model"
      });
    }
  });

  app.post("/api/team/evaluate", async (req, res) => {
    try {
      const evaluation = await evaluateTeamExpertise(req.body.team, req.body.industry);
      res.json(evaluation);
    } catch (error) {
      console.error("Team evaluation failed:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to evaluate team"
      });
    }
  });

  // Market and IP assessment routes
  app.post("/api/market/sentiment", async (req, res) => {
    try {
      const sentiment = await analyzeMarketSentiment(req.body.company, req.body.industry);
      res.json(sentiment);
    } catch (error) {
      console.error("Market sentiment analysis failed:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to analyze market sentiment"
      });
    }
  });

  app.post("/api/ip/assess", async (req, res) => {
    try {
      const assessment = await assessIntellectualProperty(req.body.ip, req.body.industry);
      res.json(assessment);
    } catch (error) {
      console.error("IP assessment failed:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to assess IP"
      });
    }
  });

  // Metrics validation route
  app.post("/api/metrics/validate", async (req, res) => {
    try {
      const validation = await validateMetrics(
        req.body.metrics,
        req.body.industry,
        req.body.region
      );
      res.json(validation);
    } catch (error) {
      console.error("Metrics validation failed:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to validate metrics"
      });
    }
  });

  // Revenue model validation route
  app.post("/api/revenue-model/validate", async (req, res) => {
    try {
      const validatedData = z.object({
        model: z.string(),
        pricing: z.any(),
        customerSegments: z.array(z.string()),
        revenueStreams: z.array(z.string()),
        industry: z.string(),
        stage: z.string(),
      }).parse(req.body);

      const analysis = await validateRevenueModel(validatedData);
      res.json(analysis);
    } catch (error) {
      console.error("Revenue model validation failed:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to validate revenue model"
      });
    }
  });

  // User profile routes
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, parseInt(userId)),
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
      const result = await db.insert(userProfiles).values(profileData).returning();
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
        .update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.userId, parseInt(userId)))
        .returning();

      if (!result.length) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Enhanced valuation route with proper validation
  app.post("/api/valuation", async (req, res) => {
    try {
      // Validate request body against our schema
      const validatedData = valuationFormSchema.parse(req.body);
      const { revenue, growthRate, margins, industry, stage } = validatedData;

      // Create a cache key from the important parameters
      const cacheKey = `${revenue}-${growthRate}-${margins}-${industry}-${stage}`;

      // Check cache first
      const cachedResult = cache.get(cacheKey);
      if (cachedResult) {
        return res.json(cachedResult);
      }

      // Calculate valuation if not in cache
      const result = await calculateValuation(validatedData);

      // Cache the result
      cache.set(cacheKey, result);
      res.json(result);
    } catch (error) {
      console.error('Valuation calculation failed:', error);

      if (error instanceof z.ZodError) {
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
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([{
        "Business Name": data.businessName,
        "Industry": data.industry,
        "Stage": data.stage,
        "Revenue": data.revenue,
        "Growth Rate": `${data.growthRate}%`,
        "Valuation": data.valuation,
      }]);

      XLSX.utils.book_append_sheet(wb, ws, "Valuation Summary");
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