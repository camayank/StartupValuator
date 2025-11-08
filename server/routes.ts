import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import valuationRoutes from "./routes/valuation";
import valuationCalculateRoutes from "./routes/valuation-calculate";
import valuationSimpleRoutes from "./routes/valuation-simple";
import valuationMethodsRoutes from "./routes/valuation-methods";
import benchmarksRoutes from "./routes/benchmarks";
import analysisRoutes from "./routes/analysis";
import monitoringRoutes from "./routes/monitoring";
import aiRoutes from "./routes/ai-routes";
import draftRoutes from "./routes/draft";
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

// WebSocket message types
type WebSocketMessage = {
  type: string;
  payload?: any;
  timestamp?: number;
};

export function registerRoutes(app: Express): Server {
  // Register all routes
  app.use("/api/valuation", valuationSimpleRoutes);
  app.use("/api/valuation", valuationCalculateRoutes);
  app.use("/api/valuation", valuationRoutes);
  app.use("/api/valuation", valuationMethodsRoutes);
  app.use("/api/valuation/draft", draftRoutes);
  app.use("/api/benchmarks", benchmarksRoutes);
  app.use("/api/analysis", analysisRoutes);
  app.use("/api/monitoring", monitoringRoutes);
  app.use("/api/ai", aiRoutes);

  const httpServer = createServer(app);

  // Set up WebSocket server with proper error handling
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws',
    verifyClient: (info: { req: IncomingMessage }) => {
      const protocol = info.req.headers['sec-websocket-protocol'];
      // Allow all connections except Vite HMR
      if (protocol && protocol.includes('vite-hmr')) {
        return false;
      }
      return true;
    }
  });

  // Track connected clients
  const clients = new Set<WebSocket>();

  // WebSocket connection handling
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('Client connected to valuation WebSocket');
    clients.add(ws);

    // Send initial connection status
    const connectionMessage: WebSocketMessage = {
      type: 'connection',
      payload: { status: 'connected' },
      timestamp: Date.now()
    };
    ws.send(JSON.stringify(connectionMessage));

    // Handle incoming messages
    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        console.log('Received WebSocket message:', message);

        switch (message.type) {
          case 'valuation_update':
            // Broadcast valuation updates to all other connected clients
            broadcastMessage(ws, {
              type: 'valuation_update',
              payload: message.payload,
              timestamp: Date.now()
            });
            break;

          case 'analysis_request':
            handleAnalysisRequest(ws, message);
            break;

          default:
            ws.send(JSON.stringify({
              type: 'error',
              payload: { message: 'Unknown message type' },
              timestamp: Date.now()
            }));
        }
      } catch (error) {
        console.error('WebSocket message handling error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Failed to process message' },
          timestamp: Date.now()
        }));
      }
    });

    // Handle connection close
    ws.on('close', () => {
      console.log('Client disconnected from valuation WebSocket');
      clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast helper function
  function broadcastMessage(sender: WebSocket, message: WebSocketMessage) {
    clients.forEach(client => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Handle analysis requests
  async function handleAnalysisRequest(ws: WebSocket, message: WebSocketMessage) {
    try {
      ws.send(JSON.stringify({
        type: 'analysis_progress',
        payload: { status: 'processing' },
        timestamp: Date.now()
      }));

      // Process analysis request
      // Add your analysis logic here

      ws.send(JSON.stringify({
        type: 'analysis_complete',
        payload: { status: 'completed' },
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Analysis request failed:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Analysis request failed' },
        timestamp: Date.now()
      }));
    }
  }

  // Note: Main valuation route is handled in ./routes/valuation.ts

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

  // Note: Additional routes for reports, compliance, exports, etc. are handled in respective route modules

  return httpServer;
}