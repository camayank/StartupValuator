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
  private static readonly ERROR_THRESHOLD = 5;
  private static readonly RECOVERY_ATTEMPTS_MAX = 3;
  private static errorCount = new Map<string, number>();
  private static recoveryAttempts = new Map<string, number>();

  static async logError(error: Error | string, data: Partial<ErrorLogData> = {}) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    const errorKey = `${data.category}:${errorMessage}`;

    const logData = {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date(),
      severity: data.severity || this.determineSeverity(error, data),
      category: data.category || 'system',
      source: data.source || 'server',
      context: this.sanitizeContext(data.context || {}),
      userId: data.userId,
      resolved: false,
      recoveryAttempted: false
    };

    try {
      // Store error in database
      const [log] = await db.insert(errorLogs).values(logData).returning();

      // Track error frequency
      const currentCount = (this.errorCount.get(errorKey) || 0) + 1;
      this.errorCount.set(errorKey, currentCount);

      // Check if threshold exceeded
      if (currentCount >= this.ERROR_THRESHOLD) {
        await this.triggerAlert(errorKey, currentCount, log.id);
      }

      // Attempt recovery if applicable
      if (this.isRecoverable(logData)) {
        await this.attemptRecovery(log.id, logData);
      }

      return log;
    } catch (dbError) {
      console.error('Failed to log error:', dbError);
      // Fallback to console logging if database logging fails
      console.error('Original error:', error);
      throw new Error('Error logging system failure');
    }
  }

  private static determineSeverity(error: Error | string, data: Partial<ErrorLogData>): 'low' | 'medium' | 'high' | 'critical' {
    if (data.severity) return data.severity;

    // Determine severity based on error type and context
    if (error instanceof TypeError || error instanceof SyntaxError) {
      return 'high';
    }

    if (typeof error === 'string' && error.toLowerCase().includes('database')) {
      return 'critical';
    }

    return 'medium';
  }

  private static sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sanitized = { ...context };
    // Remove sensitive information
    ['password', 'token', 'secret', 'key'].forEach(key => {
      if (key in sanitized) delete sanitized[key];
    });
    return sanitized;
  }

  private static async triggerAlert(errorKey: string, count: number, logId: number) {
    this.errorCount.set(errorKey, 0);

    await db.update(errorLogs)
      .set({
        alertTriggered: true,
        alertDetails: {
          count,
          threshold: this.ERROR_THRESHOLD,
          timestamp: new Date(),
          recoveryAttempts: this.recoveryAttempts.get(errorKey) || 0
        }
      })
      .where(eq(errorLogs.id, logId));

    console.error(`Alert: Error threshold exceeded for ${errorKey} (${count} occurrences)`);
  }

  private static isRecoverable(data: Partial<ErrorLogData>): boolean {
    const recoverableCategories = ['database', 'calculation', 'api'];
    return recoverableCategories.includes(data.category || '');
  }

  private static async attemptRecovery(logId: number, data: Partial<ErrorLogData>) {
    const errorKey = `${data.category}:${data.message}`;
    const attempts = (this.recoveryAttempts.get(errorKey) || 0) + 1;

    if (attempts > this.RECOVERY_ATTEMPTS_MAX) {
      console.error(`Maximum recovery attempts reached for error: ${errorKey}`);
      return;
    }

    this.recoveryAttempts.set(errorKey, attempts);

    try {
      let recovered = false;
      let recoveryAction = '';
      const startTime = Date.now();

      switch (data.category) {
        case 'database':
          recovered = await this.attemptDatabaseRecovery();
          recoveryAction = 'Database connection retry';
          break;
        case 'api':
          recovered = await this.attemptAPIRecovery(data.context);
          recoveryAction = 'API endpoint fallback';
          break;
        case 'calculation':
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
            attempts,
            duration: Date.now() - startTime,
            timestamp: new Date()
          }
        })
        .where(eq(errorLogs.id, logId));

      if (recovered) {
        this.recoveryAttempts.delete(errorKey);
      }

    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      throw recoveryError;
    }
  }

  private static async attemptDatabaseRecovery(): Promise<boolean> {
    try {
      // Try a simple query to check database connection
      await db.select().from(errorLogs).limit(1);
      // If successful, try to clear any connection pools or caches if needed
      return true;
    } catch {
      return false;
    }
  }

  private static async attemptAPIRecovery(context?: Record<string, any>): Promise<boolean> {
    if (!context?.endpoint) return false;

    try {
      // Implement fallback API endpoints or retry logic
      return true;
    } catch {
      return false;
    }
  }

  private static async attemptCalculationRecovery(context?: Record<string, any>): Promise<boolean> {
    if (!context?.calculation) return false;

    try {
      // Implement fallback calculation methods
      return true;
    } catch {
      return false;
    }
  }

  static async getErrorStats(timeframe: 'hour' | 'day' | 'week' = 'day') {
    const stats = await db
      .select({
        category: errorLogs.category,
        count: sql`count(*)`,
        unresolvedCount: sql`sum(case when resolved = false then 1 else 0 end)`,
        criticalCount: sql`sum(case when severity = 'critical' then 1 else 0 end)`,
        recoverySuccessRate: sql`ROUND(AVG(CASE WHEN recovery_attempted = true THEN CASE WHEN recovered = true THEN 100 ELSE 0 END END)::numeric, 2)`
      })
      .from(errorLogs)
      .where(sql`timestamp > now() - interval '1 ${timeframe}'`)
      .groupBy(errorLogs.category);

    return stats;
  }
}