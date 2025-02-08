import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }

    // Add detailed logging for all requests
    log(`${req.method} ${path} ${res.statusCode} ${duration}ms [${req.headers['accept'] || 'N/A'}]`);
  });

  next();
});

(async () => {
  log("Starting server initialization...");

  // Set up authentication before registering routes
  setupAuth(app);
  log("Authentication setup complete");

  const server = registerRoutes(app);
  log("Routes registered successfully");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log errors in detail
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
  }).on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      log(`Port ${PORT} is already in use. Please try a different port.`);
      process.exit(1);
    } else {
      log(`Failed to start server: ${error.message}`);
      if (error.stack) {
        log(`Error stack trace: ${error.stack}`);
      }
      throw error;
    }
  });
})().catch(error => {
  log(`Unhandled error during server startup: ${error.message}`);
  if (error.stack) {
    log(`Stack trace: ${error.stack}`);
  }
  process.exit(1);
});