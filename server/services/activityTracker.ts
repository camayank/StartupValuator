import { db } from "@db";
import { userActivities, type InsertUserActivity } from "@db/schema";
import { eq, desc } from "drizzle-orm"; // Added import for eq and desc
import type { Request } from "express";

export class ActivityTracker {
  static async trackActivity(
    userId: number,
    activityType: InsertUserActivity["activityType"],
    req: Request,
    metadata: InsertUserActivity["metadata"] = {}
  ) {
    try {
      const sessionId = req.sessionID;
      const path = req.path;

      await db.insert(userActivities).values({
        userId,
        activityType,
        path,
        sessionId,
        metadata,
      });
    } catch (error) {
      console.error("Failed to track activity:", error);
    }
  }

  static async getUserActivities(userId: number, limit = 50) {
    try {
      const activities = await db
        .select()
        .from(userActivities)
        .where(eq(userActivities.userId, userId)) // Corrected where clause
        .orderBy(desc(userActivities.createdAt)) //Added desc import and used it here.
        .limit(limit);

      return activities;
    } catch (error) {
      console.error("Failed to get user activities:", error);
      return [];
    }
  }

  static async getRecentActivityPattern(userId: number) {
    try {
      const activities = await ActivityTracker.getUserActivities(userId, 10);
      return activities.map((a) => a.activityType);
    } catch (error) {
      console.error("Failed to get activity pattern:", error);
      return [];
    }
  }
}