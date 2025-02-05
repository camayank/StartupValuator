import { z } from 'zod';
import type { Request } from 'express';
import { db } from '@db';

const activitySchema = z.object({
  userId: z.number(),
  type: z.string(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

type Activity = z.infer<typeof activitySchema>;

export class ActivityTracker {
  static async trackActivity(
    userId: number,
    type: string,
    req: Request,
    metadata?: Record<string, any>
  ): Promise<void> {
    const activity: Activity = {
      userId,
      type,
      metadata,
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    try {
      await activitySchema.parseAsync(activity);
      console.log('Activity tracked:', activity);
      // Store in database if needed
    } catch (error) {
      console.error('Activity tracking error:', error);
    }
  }
}
