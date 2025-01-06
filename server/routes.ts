import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { WorkflowSuggestionEngine } from "./services/workflowSuggestion";
import { ActivityTracker } from "./services/activityTracker";
import { userProfiles, workspaces, workspaceMembers, valuations, auditTrail } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
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
import { generateValuationInsights } from "./services/valuationInsights";

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

const addWorkspaceMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
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

  // Workspace Management Routes
  app.post("/api/workspaces", async (req, res) => {
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
      });

      res.json(workspace);
    } catch (error) {
      console.error("Failed to create workspace:", error);
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });

  // Region-specific pricing route
  app.get("/api/pricing/:region", async (req, res) => {
    const { region } = req.params;
    try {
      // Get base pricing tiers
      const basePricing = {
        free: { price: 0, features: ["Basic valuation", "Single user"] },
        startup: { price: 19.99, features: ["Multiple users", "Advanced analytics"] },
        enterprise: { price: 99.99, features: ["Custom branding", "API access"] },
      };

      // Apply regional adjustments (e.g., PPP-based pricing)
      const regionalPricing = adjustPricingForRegion(basePricing, region);
      res.json(regionalPricing);
    } catch (error) {
      console.error("Failed to get regional pricing:", error);
      res.status(500).json({ message: "Failed to get pricing information" });
    }
  });

  // Enhanced valuation route with comprehensive insights
  app.post("/api/valuation", async (req, res) => {
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

      const insights = await generateValuationInsights(validatedData);
      const baseValuation = await calculateValuation(validatedData);
      const frameworkId = validatedData.region.toLowerCase() === 'us' ? '409a' :
                         validatedData.region.toLowerCase() === 'india' ? 'icai' : 'ivs';

      const framework = frameworks[frameworkId];
      const adjustedValuation = applyFrameworkAdjustments(framework, baseValuation.valuation);

      const result = {
        ...baseValuation,
        valuation: adjustedValuation,
        insights
      };

      cache.set(cacheKey, result);

      // Track usage for billing
      await trackValuationUsage(req.user!.id, result);

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

  // Export routes with improved error handling and logging
  app.post("/api/export/:format", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { format } = req.params;
      const data = req.body;

      let result;
      let contentType;
      let fileName;

      switch (format) {
        case "pdf":
          result = await generatePdfReport(data);
          contentType = "application/pdf";
          fileName = "valuation-report.pdf";
          break;
        case "xlsx":
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet([data]);
          XLSX.utils.book_append_sheet(wb, ws, "Valuation Summary");
          result = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
          contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          fileName = "valuation-report.xlsx";
          break;
        case "csv":
          const parser = new Parser({ fields: Object.keys(data) });
          result = parser.parse([data]);
          contentType = "text/csv";
          fileName = "valuation-report.csv";
          break;
        default:
          return res.status(400).json({ message: "Unsupported export format" });
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.send(result);

      // Track export for usage analytics
      await ActivityTracker.trackActivity(req.user!.id, "report_exported", req, {
        format,
        reportType: "valuation",
      });
    } catch (error) {
      console.error(`Export to ${req.params.format} failed:`, error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to generate export"
      });
    }
  });

  // Workflow suggestion routes (unchanged)
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


  // Compliance checking routes (unchanged)
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
      price: details.price * multiplier,
    };
    return acc;
  }, {});
}

// Helper function to track valuation usage for billing
async function trackValuationUsage(userId: number, result: any) {
  try {
    await ActivityTracker.trackActivity(userId, "valuation_completed", null, {
      valuationAmount: result.valuation,
      industry: result.industry,
      complexity: calculateComplexity(result),
    });
  } catch (error) {
    console.error("Failed to track valuation usage:", error);
  }
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