import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { checkDatabaseHealth, cleanup } from "@db";
import { rateLimit } from "express-rate-limit";
import session from "express-session";

const app = express();

// Security settings
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Enhanced request logging
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Capture JSON responses
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Log on completion
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const logData = {
        requestId,
        method: req.method,
        path,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('user-agent'),
        response: capturedJsonResponse ? JSON.stringify(capturedJsonResponse).slice(0, 100) : undefined
      };

      log(`API ${logData.method} ${logData.path} ${logData.status} ${logData.duration}`);

      if (duration > 1000) {
        console.warn(`Slow request detected:`, logData);
      }
    }
  });

  next();
});

// Application startup with proper initialization sequence
(async () => {
  try {
    // Check database health before starting
    log('Checking database health...');
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      throw new Error("Database health check failed");
    }
    log('Database health check passed');

    const server = registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        code: err.code,
      });

      const status = err.status || err.statusCode || 500;
      const message = status === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message;

      res.status(status).json({ message });
    });

    // Setup Vite or serve static files
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start server
    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server started on port ${PORT}`);
      log(`Environment: ${app.get("env")}`);
      log('Application initialization complete');
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      log(`${signal} received, starting graceful shutdown...`);

      server.close(async () => {
        log('HTTP server closed');
        await cleanup();
        process.exit(0);
      });

      // Force shutdown after timeout
      setTimeout(() => {
        log('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();