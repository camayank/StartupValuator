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
import { generateComplianceReport, generateComplianceChecklist } from "./services/compliance-checker";
import workspaceRoutes from "./routes/workspace";
import { frameworks, type FrameworkId, validateFrameworkCompliance, applyFrameworkAdjustments } from "./lib/compliance/frameworks";

// Define a schema for the report data
const reportDataSchema = valuationFormSchema.extend({
  valuation: z.number(),
  multiplier: z.number(),
  details: z.object({
    baseValuation: z.number(),
    adjustments: z.record(z.string(), z.number()),
  }).optional(),
  complianceFramework: z.enum(['ivs', 'icai', '409a']).optional(),
});

export function registerRoutes(app: Express): Server {
  const cache = setupCache();

  // Set up authentication routes
  setupAuth(app);

  // Activity tracking middleware
  app.use((req, res, next) => {
    if (req.isAuthenticated() && req.user) {
      ActivityTracker.trackActivity(req.user.id, "page_view", req).catch(console.error);
    }
    next();
  });

  // Add workspace routes
  app.use("/api/workspaces", workspaceRoutes);

  // Enhanced valuation route with compliance support
  app.post("/api/valuation", async (req, res) => {
    try {
      // Validate request body against our schema
      const validatedData = valuationFormSchema.parse(req.body);
      const { revenue, growthRate, margins, industry, stage, region } = validatedData;

      // Auto-select appropriate compliance framework based on region
      let frameworkId: FrameworkId = 'ivs'; // Default to IVS
      if (region.toLowerCase() === 'us') {
        frameworkId = '409a';
      } else if (region.toLowerCase() === 'india') {
        frameworkId = 'icai';
      }

      const framework = frameworks[frameworkId];

      // Create a cache key from the important parameters
      const cacheKey = `${revenue}-${growthRate}-${margins}-${industry}-${stage}-${frameworkId}`;

      // Check cache first
      const cachedResult = cache.get(cacheKey);
      if (cachedResult) {
        return res.json(cachedResult);
      }

      // Calculate base valuation
      const baseValuation = await calculateValuation(validatedData);

      // Validate compliance requirements
      const complianceResults = validateFrameworkCompliance(framework, validatedData);
      const hasComplianceIssues = complianceResults.some(r => r.errors.length > 0);

      // Apply compliance-specific adjustments
      const adjustedValuation = applyFrameworkAdjustments(framework, baseValuation.valuation);

      const result = {
        ...baseValuation,
        valuation: adjustedValuation,
        compliance: {
          framework: frameworkId,
          requirements: complianceResults,
          hasIssues: hasComplianceIssues,
        },
      };

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

  // Compliance checking routes with enhanced documentation
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

  // Export routes with compliance documentation
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


  const httpServer = createServer(app);
  return httpServer;
}