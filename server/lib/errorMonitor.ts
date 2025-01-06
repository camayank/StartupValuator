import type { Request, Response, NextFunction } from "express";

class ErrorMonitor {
  private errors: Map<string, { count: number, firstSeen: Date, lastSeen: Date }> = new Map();
  private readonly errorThreshold = 10; // Number of errors before alerting
  private readonly timeWindow = 5 * 60 * 1000; // 5 minutes in milliseconds

  captureError(error: Error, req?: Request) {
    const errorKey = `${error.name}:${error.message}`;
    const now = new Date();
    const existingError = this.errors.get(errorKey);

    if (existingError) {
      existingError.count++;
      existingError.lastSeen = now;

      // Check if we've hit the threshold in the time window
      if (existingError.count >= this.errorThreshold &&
          now.getTime() - existingError.firstSeen.getTime() <= this.timeWindow) {
        this.alertError(errorKey, existingError);
      }
    } else {
      this.errors.set(errorKey, {
        count: 1,
        firstSeen: now,
        lastSeen: now
      });
    }

    // Log the error with context
    console.error('Error captured:', {
      error: error.message,
      stack: error.stack,
      timestamp: now.toISOString(),
      path: req?.path,
      method: req?.method,
      userId: req?.user?.id
    });
  }

  private alertError(errorKey: string, errorStats: { count: number, firstSeen: Date, lastSeen: Date }) {
    // In a real application, this would send alerts to your monitoring system
    console.error('Error threshold exceeded:', {
      error: errorKey,
      count: errorStats.count,
      timeWindow: `${this.timeWindow / 1000} seconds`,
      firstSeen: errorStats.firstSeen,
      lastSeen: errorStats.lastSeen
    });
  }

  // Cleanup old errors periodically
  cleanup() {
    const now = new Date().getTime();
    for (const [key, value] of this.errors) {
      if (now - value.lastSeen.getTime() > this.timeWindow) {
        this.errors.delete(key);
      }
    }
  }
}

export const errorMonitor = new ErrorMonitor();

// Cleanup old errors every 15 minutes
setInterval(() => errorMonitor.cleanup(), 15 * 60 * 1000);

// Express middleware for error monitoring
export default function errorMonitorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  errorMonitor.captureError(err, req);
  next(err);
}