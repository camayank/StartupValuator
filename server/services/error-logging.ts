import { db } from '@db';
import { errorLogs } from '@db/schema';
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql } from 'drizzle-orm';

export interface ErrorLogData {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'validation' | 'system' | 'calculation' | 'database' | 'api';
  source: string;
  userId?: number;
}

export class ErrorLoggingService {
  private static readonly ERROR_THRESHOLD = 5; // Number of similar errors before triggering alert
  private static errorCount = new Map<string, number>();

  static async logError(error: Error | string, data: Partial<ErrorLogData> = {}) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    const logData = {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date(),
      severity: data.severity || 'medium',
      category: data.category || 'system',
      source: data.source || 'server',
      context: data.context || {},
      userId: data.userId,
      resolved: false,
      recoveryAttempted: false
    };

    try {
      // Store error in database
      const [log] = await db.insert(errorLogs).values(logData).returning();

      // Track error frequency
      const errorKey = `${logData.category}:${errorMessage}`;
      const currentCount = (ErrorLoggingService.errorCount.get(errorKey) || 0) + 1;
      ErrorLoggingService.errorCount.set(errorKey, currentCount);

      // Check if threshold exceeded
      if (currentCount >= ErrorLoggingService.ERROR_THRESHOLD) {
        await ErrorLoggingService.triggerAlert(errorKey, currentCount, log.id);
      }

      // Attempt recovery for certain error types
      if (this.isRecoverable(logData)) {
        await this.attemptRecovery(log.id, logData);
      }

      return log;
    } catch (dbError) {
      console.error('Failed to log error:', dbError);
      // Fallback to console logging if database logging fails
      console.error('Original error:', error);
    }
  }

  private static async triggerAlert(errorKey: string, count: number, logId: number) {
    // Reset count after alert
    ErrorLoggingService.errorCount.set(errorKey, 0);

    // Update error log with alert information
    await db.update(errorLogs)
      .set({
        alertTriggered: true,
        alertDetails: {
          count,
          threshold: ErrorLoggingService.ERROR_THRESHOLD,
          timestamp: new Date()
        }
      })
      .where(eq(errorLogs.id, logId));

    // TODO: Integrate with notification service for alerts
    console.error(`Alert: Error threshold exceeded for ${errorKey} (${count} occurrences)`);
  }

  private static isRecoverable(data: Partial<ErrorLogData>): boolean {
    const recoverableCategories = ['database', 'calculation'];
    return recoverableCategories.includes(data.category || '');
  }

  private static async attemptRecovery(logId: number, data: Partial<ErrorLogData>) {
    try {
      let recovered = false;
      let recoveryAction = '';

      switch (data.category) {
        case 'database':
          // Attempt database connection recovery
          recovered = await this.attemptDatabaseRecovery();
          recoveryAction = 'Database connection retry';
          break;
        case 'calculation':
          // Attempt calculation retry with fallback methods
          recovered = await this.attemptCalculationRecovery(data.context);
          recoveryAction = 'Calculation retry with fallback';
          break;
      }

      await db.update(errorLogs)
        .set({
          recoveryAttempted: true,
          recovered,
          recoveryDetails: {
            action: recoveryAction,
            timestamp: new Date()
          }
        })
        .where(eq(errorLogs.id, logId));

    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
    }
  }

  private static async attemptDatabaseRecovery(): Promise<boolean> {
    try {
      await db.select().from(errorLogs).limit(1);
      return true;
    } catch {
      return false;
    }
  }

  private static async attemptCalculationRecovery(context?: Record<string, any>): Promise<boolean> {
    // Implement fallback calculation methods
    return false; // TODO: Implement actual recovery logic
  }

  static async getErrorStats(timeframe: 'hour' | 'day' | 'week' = 'day') {
    // Calculate error statistics for monitoring
    const stats = await db
      .select({
        category: errorLogs.category,
        count: sql`count(*)`,
        unresolvedCount: sql`sum(case when resolved = false then 1 else 0 end)`,
        criticalCount: sql`sum(case when severity = 'critical' then 1 else 0 end)`
      })
      .from(errorLogs)
      .where(
        sql`timestamp > now() - interval '1 ${timeframe}'`
      )
      .groupBy(errorLogs.category);

    return stats;
  }
}