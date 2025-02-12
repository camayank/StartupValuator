import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";
import { collaborationService } from "./services/collaboration-service";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up authentication before routes
setupAuth(app);

// Add detailed request logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  log("Starting server initialization...");

  try {
    const server = registerRoutes(app);
    log("Routes registered successfully");

    // Initialize collaboration service
    collaborationService.initialize(server);
    log("Collaboration service initialized");

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error: ${status} - ${message}`);
      if (err.stack) {
        log(`Stack: ${err.stack}`);
      }

      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      log("Setting up Vite in development mode");
      await setupVite(app, server);
      log("Vite setup complete");
    } else {
      log("Setting up static file serving");
      serveStatic(app);
    }

    const PORT = process.env.PORT || 5000;
    log(`Attempting to start server on port ${PORT}...`);

    server.listen({
      port: PORT,
      host: "0.0.0.0"
    }, () => {
      log(`Server running on port ${PORT}`);
    });

  } catch (error: any) {
    log(`Server initialization failed: ${error.message}`);
    if (error.stack) {
      log(`Stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
})().catch(error => {
  log(`Unhandled error during server startup: ${error.message}`);
  if (error.stack) {
    log(`Stack trace: ${error.stack}`);
  }
  process.exit(1);
});