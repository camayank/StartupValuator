import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import valuationRoutes from "./routes/valuation";
import analysisRoutes from "./routes/analysis";
import monitoringRoutes from "./routes/monitoring";
import aiRoutes from "./routes/ai-routes";
import { setupAuth } from "./auth";
import { userProfiles, valuationRecords } from "@db/schema";
import { eq } from "drizzle-orm";
import { valuationFormSchema } from "../client/src/lib/validations";
import { z } from "zod";
import { ActivityTracker } from "./lib/activity-tracker";
import { enhancedAIService } from "./services/enhanced-ai-service";
import { performanceTrackingService } from "./services/performance-tracking-service";
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from "http";

export function registerRoutes(app: Express): Server {
  // Register all routes
  app.use("/api/valuation", valuationRoutes);
  app.use("/api/analysis", analysisRoutes);
  app.use("/api/monitoring", monitoringRoutes);
  app.use("/api/ai", aiRoutes);

  const httpServer = createServer(app);

  // Set up WebSocket server on a specific path to avoid conflict with Vite HMR
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws/valuation',
    verifyClient: (info: { req: IncomingMessage }) => {
      const protocol = info.req.headers['sec-websocket-protocol'];
      return !protocol || !protocol.includes('vite-hmr');
    }
  });

  // WebSocket connection handling
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to valuation WebSocket');

    // Send initial connection status
    ws.send(JSON.stringify({ 
      type: 'connection', 
      status: 'connected',
      timestamp: Date.now()
    }));

    // Handle incoming messages
    ws.on('message', (message: Buffer | string) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);

        // Handle different message types
        switch (data.type) {
          case 'valuation_update':
            // Broadcast valuation updates to all connected clients
            wss.clients.forEach(client => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'valuation_update',
                  data: data.payload,
                  timestamp: Date.now()
                }));
              }
            });
            break;

          case 'analysis_request':
            // Handle analysis requests
            ws.send(JSON.stringify({
              type: 'analysis_progress',
              status: 'processing',
              timestamp: Date.now()
            }));
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('WebSocket message handling error:', error);
        ws.send(JSON.stringify({ 
          type: 'error',
          message: 'Failed to process message',
          timestamp: Date.now()
        }));
      }
    });

    // Handle connection close
    ws.on('close', () => {
      console.log('Client disconnected from valuation WebSocket');
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Enhanced valuation route with proper validation and AI integration
  app.post("/api/valuation", async (req, res) => {
    try {
      // Validate request body against our schema
      const validatedData = valuationFormSchema.parse(req.body);

      // Create a cache key from the important parameters
      const cacheKey = `${validatedData.businessInfo.name}-${validatedData.businessInfo.sector}`;

      // Get enhanced AI analysis
      const aiAnalysis = await enhancedAIService.analyzeMarket(validatedData);

      // Get user ID from session
      const userId = req.user?.id || 1; // Fallback to default user if not logged in

      // Store in database with enhanced data
      const [result] = await db.insert(valuationRecords).values({
        ...validatedData,
        aiAnalysis,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Track AI prediction for performance monitoring
      await performanceTrackingService.trackPrediction("hybrid_valuation", {
        valuationId: result.id,
        predictedValue: result.valuation,
        confidence: result.confidenceScore,
        metadata: {
          industry: validatedData.businessInfo.industry,
          stage: validatedData.businessInfo.productStage,
          aiModel: "hybrid"
        }
      });

      res.json(result);
    } catch (error) {
      console.error('Valuation processing failed:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors,
        });
      }

      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to process valuation'
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


  // Add activity tracking endpoint
  app.post("/api/activities", async (req, res) => {
    try {
      await ActivityTracker.trackActivity(
        1, // Default user ID for now
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

  return httpServer;
}